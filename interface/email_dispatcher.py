import os
import smtplib
from email.message import EmailMessage
import mimetypes
from dotenv import load_dotenv

load_dotenv()

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

def send_cold_email(target_email: str, subject: str, body_text: str, attachment_path: str = None, gmail_user: str = None, gmail_password: str = None) -> bool:
    """
    Sends an email using the provided Gmail account via SMTP.
    Returns True if successful, False otherwise.
    """
    user = gmail_user or GMAIL_USER
    password = gmail_password or GMAIL_APP_PASSWORD

    if not user or not password:
        print("[Email Dispatcher] GMAIL_USER or GMAIL_APP_PASSWORD not provided")
        return False
        
    try:
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = user
        msg['To'] = target_email
        msg.set_content(body_text)

        # Attach PDF if provided
        if attachment_path:
            import requests
            attachment_data = None
            filename = ""
            
            if attachment_path.startswith("http"):
                try:
                    res = requests.get(attachment_path, timeout=10)
                    if res.status_code == 200:
                        attachment_data = res.content
                        filename = attachment_path.split("/")[-1].split("?")[0]
                except Exception as e:
                    print(f"[Email Dispatcher] Failed to download PDF from URL: {e}")
            elif os.path.exists(attachment_path):
                with open(attachment_path, 'rb') as fp:
                    attachment_data = fp.read()
                filename = os.path.basename(attachment_path)

            if attachment_data:
                msg.add_attachment(
                    attachment_data, 
                    maintype='application', 
                    subtype='pdf', 
                    filename=filename or "Resume.pdf"
                )

        # Send via Gmail SMTP server
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(user, password)
            server.send_message(msg)
            
        print(f"[Email Dispatcher] Successfully sent email to {target_email}")
        return True
    except Exception as e:
        print(f"[Email Dispatcher] Failed to send email: {e}")
        return False
