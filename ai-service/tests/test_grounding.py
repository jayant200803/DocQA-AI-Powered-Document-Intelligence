"""Offline checks for the grounded-answer behaviour. Run: python tests/test_grounding.py"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.utils.prompts import SYSTEM_PROMPT, ABSTAIN_MESSAGE, build_messages


def test_prompt_is_grounded():
    # The old prompt allowed outside knowledge; that door must stay shut.
    assert "general knowledge" not in SYSTEM_PROMPT.lower()
    assert "only" in SYSTEM_PROMPT.lower()
    assert ABSTAIN_MESSAGE in SYSTEM_PROMPT


def test_messages_carry_context_and_abstain_rule():
    chunks = [{"fileName": "a.pdf", "chunkText": "The sky is blue."}]
    messages = build_messages("What colour is the sky?", chunks)
    system = next(m["content"] for m in messages if m["role"] == "system")
    assert "The sky is blue." in system          # context is injected
    assert ABSTAIN_MESSAGE in system              # refusal rule is present
    assert "[Source 1]" in system                 # citation labels are built


if __name__ == "__main__":
    test_prompt_is_grounded()
    test_messages_carry_context_and_abstain_rule()
    print("grounding checks passed")
