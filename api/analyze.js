module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript, repName, accountName } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'Transcript is required' });
  }

  const SYSTEM_PROMPT = `You are an elite sales coach. Analyze the sales call transcript using these exact frameworks and return ONLY valid JSON — no preamble, no markdown, no explanation.

TAPO upfront social contract: Time (confirmed availability?), Attendees (all on call?), Purpose (goal stated and agreed, co-built agenda?), Outcome (clear exit criteria and next step stated upfront?).

Command of the Message: Before State (current situation + strategic priorities?), Negative Consequences (problem, business impact, metrics?), Ideal State (prospect painted perfect scenario?), PBO (success metrics, timeline, urgency?), Required Capabilities (unique needs, integrations, decision process?), Positioning (solution tied to pain, differentiated, proof point?), Closing (vision match reached? next step scheduled?).

Qualitative: exec priorities alignment, talk ratio estimate (rep % only), question quality, quantification of impact, compelling event, decision authority.

MEDDICC: Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion, Competition.

Return this exact JSON structure with all fields filled in:
{"overall_score":0
