import {Link} from 'react-router-dom'

export function PrivacyPage() {
  return (
    <main className="layout mx-auto max-w-7xl px-6">
      <article className="legal-page">
        <header className="legal-header">
          <h1>Privacy Policy</h1>
          <p className="legal-meta">Last updated: March 22, 2026</p>
        </header>

        <section className="legal-section">
          <h2>1. Introduction</h2>
          <p>
            KeyDuel ("we", "us", "our") is committed to protecting your privacy. This Privacy
            Policy explains what information we collect, how we use it, and your choices
            regarding your data when you use our competitive code typing game ("the Service").
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Information We Collect</h2>

          <h3>2.1 Information from GitHub Authentication</h3>
          <p>
            When you sign in via GitHub, we receive the following information from your GitHub
            profile:
          </p>
          <ul>
            <li>
              <strong>Username</strong> &mdash; used as your public display name on leaderboards
              and profiles.
            </li>
            <li>
              <strong>Avatar URL</strong> &mdash; used to display your profile picture.
            </li>
            <li>
              <strong>GitHub user ID</strong> &mdash; used as a unique identifier to link your
              account.
            </li>
            <li>
              <strong>Email address</strong> (if publicly available on your GitHub profile)
              &mdash; may be used for account-related communications.
            </li>
          </ul>
          <p>
            We do not request access to your repositories, code, or any private GitHub data
            beyond basic profile information.
          </p>

          <h3>2.2 Guest Data</h3>
          <p>
            If you use the Service as a guest without signing in, we generate a random guest
            identifier stored in your browser's local storage. This allows you to maintain a
            session and have your guest race history attributed to you. No personally
            identifiable information is collected from guest users.
          </p>

          <h3>2.3 Race and Performance Data</h3>
          <p>We collect data generated through your use of the Service, including:</p>
          <ul>
            <li>Race results, scores, and typing speed (WPM/accuracy).</li>
            <li>Keystroke timing data during races (used for anti-cheat analysis).</li>
            <li>Hub preferences and race history.</li>
          </ul>

          <h3>2.4 Technical Data</h3>
          <p>
            We may collect standard technical information such as IP addresses, browser type, and
            connection data for security, rate limiting, and abuse prevention purposes.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide and operate the Service, including matchmaking and leaderboards.</li>
            <li>Display your profile, race history, and statistics publicly.</li>
            <li>
              Enforce fair play through anti-cheat systems (macro detection, rate limiting,
              keystroke analysis).
            </li>
            <li>Improve and maintain the Service's performance and reliability.</li>
            <li>Prevent abuse and protect the security of the Service.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Public Information</h2>
          <p>
            The following information is publicly visible to all users of the Service:
          </p>
          <ul>
            <li>Your username and avatar.</li>
            <li>Your race results, typing speed, accuracy, and ranking.</li>
            <li>Your profile page and race history.</li>
          </ul>
          <p>
            If you do not want this information to be public, do not create an account or use the
            Service as a guest.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Data Sharing</h2>
          <p>
            We do not sell, rent, or share your personal information with third parties for
            marketing purposes. We may share information only in the following cases:
          </p>
          <ul>
            <li>
              <strong>Public display</strong> &mdash; race data and profiles are shown publicly as
              part of the Service's core functionality.
            </li>
            <li>
              <strong>Legal requirements</strong> &mdash; if required by law, regulation, or legal
              process.
            </li>
            <li>
              <strong>Service protection</strong> &mdash; to enforce our{' '}
              <Link to="/terms">Terms of Service</Link> or protect against fraud and abuse.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>6. Cookies and Local Storage</h2>
          <p>
            We use browser cookies for session management and authentication. We also use local
            storage to persist your guest identifier and user preferences. We do not use
            third-party tracking cookies or advertising trackers.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Data Retention</h2>
          <p>
            We retain your account data and race history for as long as your account is active.
            Guest data is retained for a limited period and may be automatically cleaned up. If
            you delete your account, we will remove your personal information, though anonymized
            aggregate data (such as total race counts) may be retained.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Object to or restrict certain data processing.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us via our GitHub repository or through the
            account settings in the Service.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Security</h2>
          <p>
            We implement reasonable security measures to protect your data, including encrypted
            connections (HTTPS), secure session management, and server-authoritative race
            validation. However, no method of transmission over the Internet is 100% secure, and
            we cannot guarantee absolute security.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Children's Privacy</h2>
          <p>
            The Service is not directed at children under the age of 13. We do not knowingly
            collect personal information from children under 13. If you believe a child has
            provided us with personal information, please contact us so we can take appropriate
            action.
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will indicate the date of the
            last revision at the top of this page. Continued use of the Service after changes are
            posted constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="legal-section">
          <h2>12. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, you can reach us at{' '}
            <a href="mailto:contact@keyduel.com">contact@keyduel.com</a>.
          </p>
        </section>
      </article>
    </main>
  )
}
