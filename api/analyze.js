export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { transcript, repName, accountName } = req.body;
  if (!transcript) {
    return res.status(400).json({ error: 'Transcript is required' });
  }
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        system: `You are an elite sales coach. Analyze the sales call transcript and return ONLY valid JSON with no extra text. Use these frameworks: TAPO (Time, Attendees, Purpose, Outcome), Command of the Message (Before State, Negative Consequences, Ideal State, PBO, Required Capabilities, Positioning, Closing), Qualitative standards, and MEDDICC. Return this exact structure: {"overall_score":75,"overall_summary":"summary here","talk_ratio_estimate":45,"tapo":{"time":{"score":7,"finding":"finding","gap":"gap or empty"},"attendees":{"score":7,"finding":"finding","gap":""},"purpose":{"score":7,"finding":"finding","gap":""},"outcome":{"score":7,"finding":"finding","gap":""}},"command_of_message":{"before_state":{"score":7,"finding":"finding","gap":""},"negative_consequences":{"score":7,"finding":"finding","gap":""},"ideal_state":{"score":7,"finding":"finding","gap":""},"pbo":{"score":7,"finding":"finding","gap":""},"required_capabilities":{"score":7,"finding":"finding","gap":""},"positioning":{"score":7,"finding":"finding","gap":""},"closing":{"score":7,"finding":"finding","gap":""}},"qualitative":{"exec_priorities":{"score":7,"finding":"finding"},"question_quality":{"score":7,"finding":"finding"},"quantification":{"score":7,"finding":"finding"},"compelling_event":{"score":7,"finding":"finding"},"decision_authority":{"score":7,"finding":"finding"}},"meddicc":{"metrics":{"status":"partial","note":"note"},"economic_buyer":{"status":"partial","note":"note"},"decision_criteria":{"status":"partial","note":"note"},"decision_process":{"status":"partial","note":"note"},"identify_pain":{"status":"partial","note":"note"},"champion":{"status":"partial","note":"note"},"competition":{"status":"partial","note":"note"}},"top_coaching_moments":["moment 1","moment 2","moment 3"],"priorities_for_next_call":["priority 1","priority 2","priority 3"]}`,
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
