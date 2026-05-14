import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.qq.com";
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendVerificationCode(
  to: string,
  code: string,
  reportTitle: string
): Promise<void> {
  const transporter = getTransporter();
  const from = process.env.SMTP_USER || "";

  await transporter.sendMail({
    from: `"劳动风险诊断" <${from}>`,
    to,
    subject: `您的劳动纠纷诊断报告验证码`,
    html: `
      <div style="max-width:560px;margin:0 auto;padding:30px;font-family:PingFang SC,Microsoft YaHei,sans-serif">
        <div style="text-align:center;margin-bottom:30px">
          <h1 style="font-size:20px;color:#1a2b4a;margin:0">劳动纠纷诊断报告</h1>
        </div>
        <div style="background:#f8f9fb;border-radius:12px;padding:40px;text-align:center">
          <h2 style="font-size:16px;color:#333;margin:0 0 10px">您的验证码</h2>
          <div style="font-size:40px;font-weight:bold;color:#1a2b4a;letter-spacing:8px;margin:20px 0;padding:20px;background:#fff;border-radius:8px">
            ${code}
          </div>
          <p style="font-size:14px;color:#888;margin:0">
            请在页面中输入以上验证码解锁：${reportTitle}
          </p>
          <p style="font-size:12px;color:#aaa;margin-top:20px">
            验证码有效期为 30 分钟，如非本人操作请忽略此邮件
          </p>
        </div>
        <div style="text-align:center;margin-top:20px">
          <p style="font-size:12px;color:#ccc">本邮件由系统自动发送，请勿回复</p>
        </div>
      </div>
    `,
  });
}
