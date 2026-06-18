from gltest import get_contract_factory, create_account
from gltest.assertions import tx_execution_succeeded


def test_rosetta_consensus():
    factory = get_contract_factory("Rosetta")
    contract = factory.deploy(args=[])  # deployer becomes owner and party A

    # Party A describes the intended thing (deterministic write, no LLM yet).
    party_a = (
        "A weekly team sync every Tuesday at 10am for thirty minutes, "
        "where each person shares progress and blockers."
    )
    rc_open = contract.open_brief(args=[party_a]).transact()
    assert tx_execution_succeeded(rc_open)

    briefs = contract.get_briefs(args=[0]).call()
    assert len(briefs) == 1
    bid = briefs[0]["id"]
    assert bid == "brief-0"
    assert briefs[0]["status"] == "AWAITING_B"
    assert briefs[0]["alignment"] == ""
    assert int(briefs[0]["divergence_count"]) == 0

    # Party B is a genuinely different account describing the SAME thing in their
    # own words, deliberately very close so the two should largely converge.
    party_b_signer = create_account()
    party_b = (
        "A short Tuesday morning standup, about half an hour, "
        "where everyone gives a quick update on what they did and what is stuck."
    )
    rc_respond = contract.connect(party_b_signer).respond(args=[bid, party_b]).transact()
    assert tx_execution_succeeded(rc_respond)

    seated = contract.get_brief(args=[bid]).call()
    assert seated["status"] == "OPEN"
    assert seated["party_b"] != ""
    assert seated["a_addr"] != seated["b_addr"]

    # The AI consensus write: the Mediator reconciles both descriptions.
    rc_reconcile = contract.reconcile(args=[bid]).transact()
    assert tx_execution_succeeded(rc_reconcile)

    record = contract.get_brief(args=[bid]).call()
    assert record["status"] == "RECONCILED"

    # divergence_count is a non-negative integer (a plain count, not a rating).
    count = int(record["divergence_count"])
    assert count >= 0

    # Alignment is derived deterministically from the count.
    assert record["alignment"] == ("ALIGNED" if count == 0 else "DIVERGENT")

    # The reconciled spec is bounded and the divergence list is capped.
    assert 0 <= len(record["reconciled_spec"]) <= 800
    assert isinstance(record["divergences"], list)
    assert len(record["divergences"]) <= 8

    stats = contract.get_stats(args=[]).call()
    assert int(stats["briefs"]) == 1
    assert int(stats["reconciled"]) == 1
