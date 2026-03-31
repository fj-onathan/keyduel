import {Link} from 'react-router-dom'

export function TermsPage() {
  return (
    <main className="layout mx-auto max-w-7xl px-6">
      <article className="legal-page">
        <header className="legal-header">
          <h1>Terms of Service</h1>
          <p className="legal-meta">Last updated: March 22, 2026</p>
        </header>

        <section className="legal-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using KeyDuel ("the Service"), you agree to be bound by these Terms
            of Service. If you do not agree to these terms, do not use the Service. We may update
            these terms from time to time, and continued use of the Service after changes
            constitutes acceptance of the revised terms.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Description of Service</h2>
          <p>
            KeyDuel is a competitive code typing game where users race against each other by
            typing real code snippets in real time. The Service includes matchmaking, live
            leaderboards, user profiles, race history, and related features.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Accounts and Authentication</h2>
          <p>
            You may use the Service as a guest or sign in via a third-party provider (GitHub).
            When you authenticate, we receive limited profile information from your provider as
            described in our <Link to="/privacy">Privacy Policy</Link>.
          </p>
          <p>
            You are responsible for maintaining the security of your account. You must not share
            your session or impersonate another user. We reserve the right to suspend or terminate
            accounts that violate these terms.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use automation, macros, scripts, or any tools to gain an unfair advantage in races.</li>
            <li>Exploit bugs, vulnerabilities, or unintended behavior in the Service.</li>
            <li>Circumvent anti-cheat systems, rate limits, or fairness controls.</li>
            <li>Harass, abuse, or disrupt other users' experience.</li>
            <li>Submit or inject malicious content into the Service.</li>
            <li>
              Use the Service in any manner that could damage, disable, or impair its
              infrastructure.
            </li>
          </ul>
          <p>
            We reserve the right to investigate and take appropriate action against violations,
            including suspending or banning your account and removing your data from leaderboards.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Intellectual Property</h2>
          <p>
            The KeyDuel source code is licensed under the Functional Source License, Version 1.1,
            Apache 2.0 Future License (FSL-1.1-ALv2). The license terms govern your rights to
            use, modify, and distribute the source code. All branding, logos, and visual design
            elements of KeyDuel remain the property of their respective owners.
          </p>
          <p>
            Code snippets used in races are sourced from open-source projects and are subject to
            their respective licenses. KeyDuel does not claim ownership of third-party code
            snippets.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. User Content</h2>
          <p>
            Any content you generate through the Service (such as race results, statistics, and
            profile information) may be displayed publicly on leaderboards and profile pages. By
            using the Service, you grant KeyDuel a non-exclusive, worldwide license to display
            this content in connection with the Service.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Disclaimers</h2>
          <p>
            The Service is provided "as is" and "as available" without warranties of any kind,
            either express or implied. We do not guarantee that the Service will be uninterrupted,
            secure, or error-free. Your use of the Service is at your own risk.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, KeyDuel and its maintainers shall
            not be liable for any indirect, incidental, special, consequential, or punitive
            damages arising out of or relating to your use of the Service.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Termination</h2>
          <p>
            We may suspend or terminate your access to the Service at any time, with or without
            cause, with or without notice. Upon termination, your right to use the Service will
            immediately cease. Provisions of these terms that by their nature should survive
            termination will survive.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Changes to These Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will indicate the date of
            the last revision at the top of this page. Material changes will be communicated
            through the Service. Your continued use of the Service after changes are posted
            constitutes your acceptance of the updated terms.
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Contact</h2>
          <p>
            If you have questions about these Terms of Service, you can reach us at{' '}
            <a href="mailto:contact@keyduel.com">contact@keyduel.com</a>.
          </p>
        </section>
      </article>
    </main>
  )
}
