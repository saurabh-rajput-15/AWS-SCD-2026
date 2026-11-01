# Mailtrap DNS Configuration

DNS records required to configure **Mailtrap** email sending for `aws-scd-dhule.tech`.

## Required DNS Records

| Type | Name | Value |
|---|---|---|
| CNAME | `mt89.aws-scd-dhule.tech` | `smtp.mailtrap.live` |
| CNAME | `rwmt1._domainkey.aws-scd-dhule.tech` | `rwmt1.dkim.smtp.mailtrap.live` |
| CNAME | `rwmt2._domainkey.aws-scd-dhule.tech` | `rwmt2.dkim.smtp.mailtrap.live` |
| TXT | `_dmarc.aws-scd-dhule.tech` | `v=DMARC1; p=none; rua=mailto:dmarc@smtp-staging.mailtrap.net; ruf=mailto:dmarc@smtp-staging.mailtrap.net; rf=afrf; pct=100` |
| CNAME | `mt-link.aws-scd-dhule.tech` | `t.mailtrap.live` |

## Purpose

- **CNAME (`mt89`)**: Routes outbound email through Mailtrap's SMTP relay
- **CNAME (`rwmt1`, `rwmt2`)**: DKIM signing keys for email authentication
- **TXT (`_dmarc`)**: DMARC policy for email spoofing protection
- **CNAME (`mt-link`)**: Link tracking domain for Mailtrap

