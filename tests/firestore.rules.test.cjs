const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  initializeTestEnvironment, assertFails, assertSucceeds
} = require('@firebase/rules-unit-testing');
const {
  doc, collection, getDoc, getDocs, setDoc, updateDoc, serverTimestamp
} = require('firebase/firestore');

let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-searho7-privacy',
    firestore: {
      rules: fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8')
    }
  });
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users', 'alice'), {
      uid: 'alice', role: 'student', displayName: 'Alice', email: 'alice@example.test'
    });
    await setDoc(doc(db, 'users', 'bob'), {
      uid: 'bob', role: 'student', displayName: 'Bob', email: 'bob@example.test'
    });
    await setDoc(doc(db, 'messages', 'legacy'), {
      roomId: 'academic-general', text: 'Historic global conversation'
    });
  });
});
after(async () => {
  if (env) await env.cleanup();
});

test('private profiles: owner can read and update safe fields; strangers cannot read or list', async () => {
  const alice = env.authenticatedContext('alice').firestore();
  const bob = env.authenticatedContext('bob').firestore();
  await assertSucceeds(getDoc(doc(alice, 'users', 'alice')));
  await assertFails(getDoc(doc(bob, 'users', 'alice')));
  await assertFails(getDocs(collection(alice, 'users')));
  await assertSucceeds(updateDoc(doc(alice, 'users', 'alice'), { displayName: 'Updated' }));
  const profile = await getDoc(doc(alice, 'users', 'alice'));
  assert.equal(profile.data().displayName, 'Updated');
});

test('users cannot grant themselves roles or teacher verification', async () => {
  const alice = env.authenticatedContext('alice').firestore();
  const charlie = env.authenticatedContext('charlie').firestore();
  await assertFails(updateDoc(doc(alice, 'users', 'alice'), { role: 'teacher' }));
  await assertFails(updateDoc(doc(alice, 'users', 'alice'), { isTeacher: true }));
  await assertFails(setDoc(doc(charlie, 'users', 'charlie'), {
    uid: 'charlie', role: 'teacher'
  }));
  await assertSucceeds(setDoc(doc(charlie, 'users', 'charlie'), {
    uid: 'charlie', role: 'student'
  }));
});

test('student chat is isolated by UID; forged legacy global writes are denied', async () => {
  const alice = env.authenticatedContext('alice').firestore();
  const bob = env.authenticatedContext('bob').firestore();
  const body = {
    text: 'Solve 2x+3=7', roomId: 'math-physics',
    authorId: 'alice', authorName: 'Alice',
    createdAt: serverTimestamp()
  };
  await assertSucceeds(setDoc(doc(alice, 'users', 'alice', 'messages', 'm1'), body));
  await assertSucceeds(getDoc(doc(alice, 'users', 'alice', 'messages', 'm1')));
  await assertFails(getDoc(doc(bob, 'users', 'alice', 'messages', 'm1')));
  await assertFails(setDoc(doc(bob, 'users', 'alice', 'messages', 'm2'), body));
  await assertFails(getDoc(doc(alice, 'messages', 'legacy')));
  await assertFails(setDoc(doc(alice, 'messages', 'new'), body));
  await assertSucceeds(updateDoc(doc(alice, 'users', 'alice', 'messages', 'm1'), {
    hasAiResponded: true
  }));
  await assertFails(updateDoc(doc(alice, 'users', 'alice', 'messages', 'm1'), {
    authorId: 'bob'
  }));
});

test('private project tasks require ownership', async () => {
  const alice = env.authenticatedContext('alice').firestore();
  const bob = env.authenticatedContext('bob').firestore();
  const location = ['users','alice','projects','default-hub','tasks','task-1'];
  await assertSucceeds(setDoc(doc(alice, ...location), { title:'Homework', status:'todo' }));
  await assertFails(getDoc(doc(bob, ...location)));
  await assertFails(setDoc(doc(bob, ...location), { title:'Tamper' }));
  await assertFails(getDoc(doc(alice, 'projects','default-hub')));
});

test('unauthenticated requests cannot access protected documents', async () => {
  const anon = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(anon, 'users', 'alice')));
  await assertFails(getDoc(doc(anon, 'users', 'alice', 'messages', 'm1')));
});
