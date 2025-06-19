// Email templates for gift and team notifications

export function generateGiftEmailHTML(gift: {
  redemptionCode: string
  plan: string
  durationMonths: number
  personalMessage?: string
  recipientEmail: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've received a Z6Chat gift!</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #1a1a1a;
      color: #e5e5e5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 40px;
      border: 1px solid #3a3a3a;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .gift-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    h1 {
      color: #fff;
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 10px;
    }
    .subtitle {
      color: #a5a5a5;
      font-size: 18px;
      margin: 0;
    }
    .message-box {
      background-color: #1a1a1a;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      border-left: 4px solid #8b5cf6;
    }
    .message-label {
      color: #8b5cf6;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .redemption-code {
      background-color: #3a3a3a;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code-label {
      color: #a5a5a5;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .code {
      font-family: 'Courier New', monospace;
      font-size: 28px;
      font-weight: 700;
      color: #ec4899;
      letter-spacing: 2px;
    }
    .details {
      margin: 30px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 15px 0;
      border-bottom: 1px solid #3a3a3a;
    }
    .detail-label {
      color: #a5a5a5;
    }
    .detail-value {
      color: #fff;
      font-weight: 600;
    }
    .cta-button {
      display: block;
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      color: #fff;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      text-align: center;
      font-weight: 600;
      font-size: 18px;
      margin: 40px auto 0;
      max-width: 300px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      color: #6a6a6a;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="gift-icon">🎁</div>
        <h1>You've received a gift!</h1>
        <p class="subtitle">Someone special has gifted you Z6Chat Pro</p>
      </div>

      ${
        gift.personalMessage
          ? `
      <div class="message-box">
        <div class="message-label">Personal Message</div>
        <p>${gift.personalMessage}</p>
      </div>
      `
          : ""
      }

      <div class="redemption-code">
        <div class="code-label">Your Gift Code</div>
        <div class="code">${gift.redemptionCode}</div>
      </div>

      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Plan</span>
          <span class="detail-value">Z6Chat ${gift.plan.charAt(0).toUpperCase() + gift.plan.slice(1)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration</span>
          <span class="detail-value">${gift.durationMonths} ${gift.durationMonths === 1 ? "month" : "months"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Value</span>
          <span class="detail-value">$${gift.durationMonths * 20}</span>
        </div>
      </div>

      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://z6chat.com"}/redeem" class="cta-button">
        Redeem Your Gift
      </a>

      <div class="footer">
        <p>This gift expires in 365 days. Don't wait to activate it!</p>
        <p>© 2025 Z6Chat. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

export function generateTeamInviteEmailHTML(invite: {
  teamName: string
  inviteCode: string
  inviterName: string
  planType: "family" | "team"
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to join ${invite.teamName} on Z6Chat</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #1a1a1a;
      color: #e5e5e5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 40px;
      border: 1px solid #3a3a3a;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .team-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    h1 {
      color: #fff;
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 10px;
    }
    .invite-code {
      background-color: #3a3a3a;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code {
      font-family: 'Courier New', monospace;
      font-size: 32px;
      font-weight: 700;
      color: #3b82f6;
      letter-spacing: 2px;
    }
    .cta-button {
      display: block;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: #fff;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      text-align: center;
      font-weight: 600;
      font-size: 18px;
      margin: 40px auto 0;
      max-width: 300px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="team-icon">👥</div>
        <h1>You're invited!</h1>
        <p>${invite.inviterName} has invited you to join "${invite.teamName}" on Z6Chat</p>
      </div>

      <div class="invite-code">
        <p>Your invite code:</p>
        <div class="code">${invite.inviteCode}</div>
      </div>

      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://z6chat.com"}/settings" class="cta-button">
        Join Team
      </a>
    </div>
  </div>
</body>
</html>
  `
}
