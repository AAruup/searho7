SEA_RHO7_IDENTITY = """
You are SEA.RHO7.
SEA means flow, clarity, and movement.
RHO carries the spirit of Ronaldo and the idea of flowing forward.
7 is discipline, clutch energy, and a small tribute to the user's idols.
You are not a demo chatbot. You are a practical daily-life AI problem solver.
""".strip()


CORE_RULES = [
    "Answer directly first. Do not only ask for more details.",
    "Use simple warm language.",
    "Give the smallest useful next action.",
    "If a topic is for study, teach with meaning, key idea, formula if needed, example, and one practice question.",
    "If a topic is for coding or app building, give a fix path and the next command or file to edit.",
    "If a topic is for lyrics or animation, give timing, mood, movement, colors, and export advice.",
    "For health, legal, money, or safety topics, stay general and recommend a qualified professional when needed.",
    "Avoid fake metrics, fake people, empty planning, and dramatic sci-fi words.",
]


SKILLS = {
    "study_tutor": {
        "name": "Study Tutor",
        "triggers": ["teach", "explain", "math", "physics", "fluid", "pythagoras", "school", "college"],
        "instruction": "Teach like a calm tutor. Include a tiny example and one practice question.",
    },
    "code_builder": {
        "name": "Code Builder",
        "triggers": ["code", "python", "javascript", "firebase", "bug", "deploy", "railway", "flask"],
        "instruction": "Be practical. Name the next file, command, or setting when useful.",
    },
    "lyrics_motion": {
        "name": "Lyrics To Animation",
        "triggers": ["lyrics", "song", "animation", "video", "motion", "music"],
        "instruction": "Turn words into a visual plan with scene timing, motion, color, and camera feel.",
    },
    "life_solver": {
        "name": "Daily Life Solver",
        "triggers": ["plan", "day", "routine", "problem", "decision", "help", "idea"],
        "instruction": "Give a direct next step and a simple plan the user can do today.",
    },
}


def detect_skill(question):
    text = question.lower()
    for skill_id, skill in SKILLS.items():
        if any(trigger in text for trigger in skill["triggers"]):
            return skill_id
    return "life_solver"


def describe_skills():
    return [
        {
            "id": skill_id,
            "name": skill["name"],
            "triggers": skill["triggers"],
        }
        for skill_id, skill in SKILLS.items()
    ]


def build_prompt(body, decoded_user):
    question = str(body.get("question", "")).strip()
    mode = str(body.get("mode", "general"))
    room_id = str(body.get("roomId", "dashboard"))
    user_name = str(body.get("userName") or decoded_user.get("name") or "student")
    context = str(body.get("context", ""))
    skill_id = detect_skill(question)
    skill = SKILLS[skill_id]

    parts = [
        SEA_RHO7_IDENTITY,
        "Core behavior:",
        *[f"- {rule}" for rule in CORE_RULES],
        f"Active skill: {skill['name']}",
        f"Skill instruction: {skill['instruction']}",
        f"User name: {user_name}",
        f"Signed in user id: {decoded_user['uid']}",
        f"Mode: {mode}",
        f"Room: {room_id}",
    ]
    if context:
        parts.append(f"Context:\n{context}")
    parts.append(f"User request:\n{question}")
    return "\n".join(parts)


def create_local_answer(question):
    text = question.strip()
    lower = text.lower()

    if "pythagoras" in lower or "puthagoras" in lower:
        return "\n".join([
            "Pythagoras theorem says: in a right-angled triangle, the longest side squared equals the sum of the other two sides squared.",
            "",
            "Formula: a^2 + b^2 = c^2",
            "",
            "Example: if the two shorter sides are 3 and 4, then c^2 = 3^2 + 4^2 = 9 + 16 = 25, so c = 5.",
            "",
            "Use it when you know two sides of a right triangle and need the third side.",
            "",
            "Practice: if a = 5 and b = 12, what is c?",
        ])

    if "fluid" in lower:
        return "\n".join([
            "Fluid mechanics is the study of liquids and gases in rest or motion.",
            "",
            "The core idea: fluids move because of pressure, gravity, viscosity, and boundaries.",
            "",
            "Key beginner topics:",
            "1. Pressure: force spread over area.",
            "2. Buoyancy: upward force from a fluid.",
            "3. Flow rate: how much fluid passes each second.",
            "4. Bernoulli idea: faster flow usually means lower pressure.",
            "",
            "Tiny example: water flows faster when you partially cover a pipe opening because the same water is squeezed through a smaller area.",
            "",
            "Practice: why does a plane wing need air pressure difference?",
        ])

    if "lyrics" in lower or "animation" in lower:
        return "\n".join([
            "For lyrics to animation, split the song into lines, then give each line a visual action.",
            "",
            "Simple structure:",
            "1. Beat 1-4: show the main emotion with color.",
            "2. Beat 5-8: move the camera or text with the rhythm.",
            "3. Chorus: make the biggest visual change.",
            "4. Final line: slow down and hold the strongest image.",
            "",
            "Blue can carry depth and calm. Saffron can carry energy, courage, and rise.",
            "",
            "Next step: paste 4 lyric lines and SEA.RHO7 can turn them into a shot-by-shot animation plan.",
        ])

    if "python" in lower or "flask" in lower:
        return "\n".join([
            "Python with Flask can make SEA.RHO7 independent because the AI key stays on a server.",
            "",
            "Best structure:",
            "1. Flask receives the question.",
            "2. SEA.RHO7 brain builds the prompt.",
            "3. Gemini answers.",
            "4. Flask sends the answer back to the app.",
            "",
            "Next smallest action: host the `python-ai` folder on Railway and add your Gemini key as a private variable.",
        ])

    if "firebase" in lower or "railway" in lower or "deploy" in lower:
        return "\n".join([
            "Best deployment path for SEA.RHO7 right now:",
            "",
            "Firebase hosts the app and login.",
            "Railway hosts the Python AI brain.",
            "Gemini key stays hidden in Railway variables.",
            "",
            "After Railway gives you a public URL, connect the app to `/api/ask` and redeploy Firebase Hosting.",
        ])

    return "\n".join([
        f"You asked: {text}",
        "",
        "Here is the useful first move:",
        "",
        "1. Turn the problem into one clear outcome.",
        "2. Do the smallest action that proves progress.",
        "3. Check the result.",
        "4. Improve one step.",
        "",
        "SEA.RHO7 can go deeper if you tell me the topic, level, and the output you want.",
    ])
