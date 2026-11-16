import unittest
from unittest.mock import patch
import agent

class AgentTests(unittest.TestCase):
    def test_success(self):
        class Response:
            status = 200
            def __enter__(self): return self
            def __exit__(self, *args): pass
        with patch('agent.urllib.request.urlopen', return_value=Response()):
            result = agent.check()
        self.assertTrue(result['ok'])
        self.assertEqual(result['status'], 200)

    def test_http_failure(self):
        class Response:
            status = 503
            def __enter__(self): return self
            def __exit__(self, *args): pass
        with patch('agent.urllib.request.urlopen', return_value=Response()):
            result = agent.check()
        self.assertFalse(result['ok'])
        self.assertEqual(result['status'], 503)

    def test_network_failure(self):
        with patch('agent.urllib.request.urlopen', side_effect=TimeoutError('timeout')):
            result = agent.check()
        self.assertFalse(result['ok'])
        self.assertEqual(result['error_type'], 'TimeoutError')

if __name__ == '__main__':
    unittest.main()
