export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript, repName, accountName } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'Transcript is required' });
  }

  const SYSTEM_PROMPT = `You are an elite sales coach. Analyze the sales call transcript using these exact frameworks and return ONLY valid JSON — no preamble, no markdown, no explanation.

TAPO upfront social contract: Time (confirmed availability?), Attendees (all on call?), Purpose (goal stated and agreed, co-built agenda?), Outcome (clear exit criteria and next step stated upfront?).

Command of the Message discovery: Before State (current situation + strategic priorities understood?), Negative Consequences (problem, business impact, personal impact, metrics?), Ideal State (prospect painted their own perfect scenario?), PBO (success metrics, measurement, timeline, urgency?), Required Capabilities (unique needs, integrations, decision process?), Positioning (solution tied to their specific pain, differentiated, proof point, customer story?), Closing (vision match reached? next step scheduled? disqualification handled?).

Qualitative: exec priorities alignment, talk ratio estimate (rep % only), question quality (lawyer-style investigative follow-ups?), quantification (impact of change AND status quo?), compelling event identified?, decision authority mapped?.

MEDDICC: Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion, Competition.

Return this exact JSON:
{"overall_score":0,"overall_summary":"","talk_ratio_estimate":0,"tapo":{"time":{"score":0,"finding":"","gap":""},"attendees":{"score":0,"finding":"","gap":""},"purpose":{"score":0,"finding":"","gap":""},"outcome":{"score":0,"finding":"","gap":""}},"command_of_message":{"before_state":{"score":0,"finding":"","gap":""},"negative_consequences":{"score":0,"finding":"","gap":""},"ideal_state":{"score":0,"finding":"","gap":""},"pbo":{"score":0,"finding":"","gap":""},"required_capabilities":{"score":0,"finding":"","gap":""},"positioning":{"score":0,"finding":"","gap":""},"closing":{"score":0,"finding":"","gap":""}},"qualitative":{"exec_priorities":{"score":0,"finding":""},"question_quality":{"score":0,"finding":""},"quantification":{"score":0,"finding":""},"compelling_event":{"score":0,"finding":""},"decision_authority":{"score":0,"finding":""}},"meddicc":{"metrics":{"status":"missing","note":""},"economic_buyer":{"status":"missing","note":""},"decision_criteria":{"status":"missing","note":""},"decision_process":{"status":"missing","note":""},"identify_pain":{"status":"missing","note":""},"champion":{"status":"missing","note":""},"competition":{"status":"missing","note":""}},"top_coaching_moments":["","",""],"priorities_for_next_call":["","",""]}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `Rep: ${repName || 'Rep'}\nAccount: ${accountName || 'Prospect'}\n\nTRANSCRIPT:\n${transcript}`
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(500).json({ error: err?.error?.message || 'Anthropic API error' });
    }

    const data = await response.json();
    const text = data.content.filter(i => i.type === 'text').map(i => i.text).join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
}
