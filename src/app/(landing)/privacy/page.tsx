import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-16">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-block">
        ← Back to unchurnly.com
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2 mt-8">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: 14 June 2026</p>

      <div className="text-gray-600 text-sm leading-relaxed space-y-6">
        <p>
          This Privacy Notice for Mohammad Khushab Khan (doing business as Unchurnly) (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) describes
          how and why we might access, collect, store, use, and/or share (&quot;process&quot;) your personal information when you use
          our services (&quot;Services&quot;), including when you:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Visit our website at unchurnly.com or any website of ours that links to this Privacy Notice.</li>
          <li>
            Use Unchurnly — a B2B SaaS platform that connects to your Stripe account to automate dunning emails,
            recover failed payments, and manage subscriber cancel flows.
          </li>
          <li>Engage with us in other related ways, including any marketing or support correspondence.</li>
        </ul>
        <p>
          Questions or concerns? Reading this Privacy Notice will help you understand your privacy rights and choices.
          If you do not agree with our policies and practices, please do not use our Services. If you still have any
          questions or concerns, please contact us at{' '}
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">Summary of Key Points</h2>
        <p>
          <strong>What personal information do we process?</strong> When you visit, use, or navigate our Services,
          we may process personal information depending on how you interact with us and the Services, the choices
          you make, and the products and features you use.
        </p>
        <p>
          <strong>Do we process any sensitive personal information?</strong> Some of the information may be
          considered &quot;special&quot; or &quot;sensitive&quot; in certain jurisdictions, such as financial data connected
          through your Stripe account. We only process such information where we have a lawful basis to do so.
        </p>
        <p>
          <strong>Do we collect any information from third parties?</strong> We may receive information from
          Stripe and other connected services when you authorise the connection.
        </p>
        <p>
          <strong>How do we process your information?</strong> We process your information to provide, improve,
          and administer our Services, to communicate with you, for security and fraud prevention, and to comply
          with law.
        </p>
        <p>
          <strong>In what situations and with which parties do we share personal information?</strong> We may share
          information in specific situations and with specific third parties. See section 4 for details.
        </p>
        <p>
          <strong>How do we keep your information safe?</strong> We have appropriate organisational and technical
          processes and procedures in place to protect your personal information. However, no electronic
          transmission over the internet or information storage technology can be guaranteed to be 100% secure.
        </p>
        <p>
          <strong>What are your rights?</strong> Depending on where you are located geographically, the applicable
          privacy law may mean you have certain rights regarding your personal information.
        </p>
        <p>
          <strong>How do you exercise your rights?</strong> The easiest way is to email us at{' '}
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>.
          We will consider and act upon any request in accordance with applicable data protection laws.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">1. What Information Do We Collect?</h2>
        <p>
          <strong>Personal information you disclose to us.</strong> We collect personal information that you
          voluntarily provide to us when you register on the Services, express an interest in obtaining information
          about us or our products and Services, when you participate in activities on the Services, or otherwise
          when you contact us.
        </p>
        <p>The personal information we collect may include the following:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Names</li>
          <li>Email addresses</li>
          <li>Usernames and passwords</li>
          <li>Business or company names</li>
          <li>Stripe account credentials (OAuth token — stored encrypted with AES-256)</li>
        </ul>
        <p>
          <strong>Payment Data.</strong> We do not directly collect or store payment card data. All subscription
          billing is handled through Stripe, Inc. You may review Stripe&apos;s Privacy Policy at stripe.com/privacy.
          When you connect your Stripe account to Unchurnly via Stripe Connect OAuth, we store an encrypted access
          token that allows us to retrieve your customer and subscription data on your behalf.
        </p>
        <p>
          <strong>Information automatically collected.</strong> We automatically collect certain information when
          you visit, use, or navigate the Services. This information does not reveal your specific identity (like
          your name or contact information) but may include device and usage information, such as your IP address,
          browser and device characteristics, operating system, language preferences, referring URLs, device name,
          country, location, information about how and when you use our Services, and other technical information.
          This information is primarily needed to maintain the security and operation of our Services and for our
          internal analytics and reporting purposes.
        </p>
        <p>The information we collect includes:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><em>Log and Usage Data.</em> Log and usage data is service-related, diagnostic, usage, and performance information that our servers automatically collect. It may include your IP address, device information, browser type and settings, and information about your activity in the Services.</li>
          <li><em>Device Data.</em> We collect device data such as information about your computer, phone, tablet, or other device you use to access the Services.</li>
        </ul>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">2. How Do We Process Your Information?</h2>
        <p>
          We process your personal information for a variety of reasons, depending on how you interact with our
          Services, including:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>To facilitate account creation and authentication and otherwise manage user accounts.</li>
          <li>To deliver and facilitate delivery of services to the user.</li>
          <li>To respond to user inquiries and offer support to users.</li>
          <li>To send administrative information to you, such as product updates, security alerts, and changes to our terms.</li>
          <li>To send you marketing and promotional communications (where you have opted in or where permitted by law).</li>
          <li>To deliver targeted advertising to you where permitted by applicable law.</li>
          <li>To protect our Services, including fraud monitoring and prevention.</li>
          <li>To identify usage trends and improve our Services.</li>
          <li>To comply with our legal obligations.</li>
        </ul>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">3. What Legal Bases Do We Rely On to Process Your Information?</h2>
        <p>
          <em>If you are located in the EU or UK,</em> this section applies to you. The General Data Protection
          Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process
          your personal information. We may rely on the following legal bases:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Consent.</strong> We may process your information if you have given us permission to use your personal information for a specific purpose.</li>
          <li><strong>Performance of a Contract.</strong> We may process your personal information when we believe it is necessary to fulfil our contractual obligations to you.</li>
          <li><strong>Legitimate Interests.</strong> We may process your information when we believe it is reasonably necessary to achieve our legitimate business interests and those interests do not outweigh your interests and fundamental rights and freedoms.</li>
          <li><strong>Legal Obligations.</strong> We may process your information where we believe it is necessary for compliance with our legal obligations.</li>
          <li><strong>Vital Interests.</strong> We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party.</li>
        </ul>
        <p>
          <em>If you are located in Canada,</em> this section applies to you. We may process your information if
          you have given us specific express consent to use your personal information for a specific purpose, or in
          situations where your permission can be implied. You can withdraw your consent at any time.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">4. When and With Whom Do We Share Your Personal Information?</h2>
        <p>
          We may share information in the following situations:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
          <li><strong>When we use Google Analytics.</strong> We may share your information with Google Analytics to track and analyse the use of the Services.</li>
          <li><strong>Affiliates.</strong> We may share your information with our affiliates, in which case we will require those affiliates to honour this Privacy Notice.</li>
          <li><strong>Business Partners.</strong> We may share your information with our business partners to offer you certain products, services, or promotions.</li>
          <li><strong>Other Users.</strong> When you share personal information or otherwise interact in public areas of the Services, such information may be viewed by all users.</li>
        </ul>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">5. Do We Offer Artificial Intelligence-Based Products?</h2>
        <p>
          We offer products, features, or tools powered by artificial intelligence, machine learning, or similar
          technologies (collectively, &quot;AI Products&quot;). These tools are designed to enhance your experience and
          provide you with innovative solutions. The terms in this section apply when you use our AI Products.
        </p>
        <p>
          We use the personal information you provide us in connection with our AI Products for the purposes
          outlined in this Privacy Notice. We do not use your personal information to train AI models without
          your explicit consent.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">6. Is Your Information Transferred Internationally?</h2>
        <p>
          Our servers are located in the United States (via Supabase and Vercel). If you are accessing our Services
          from outside the United States, please be aware that your information may be transferred to, stored, and
          processed by us in our facilities and by those third parties with whom we may share your personal
          information, in the United States and other countries.
        </p>
        <p>
          If you are a resident in the European Economic Area (EEA), United Kingdom (UK), or Switzerland, then
          these countries may not necessarily have data protection laws or other similar laws as comprehensive as
          those in your country. However, we will take all necessary measures to protect your personal information
          in accordance with this Privacy Notice and applicable law.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">7. How Long Do We Keep Your Information?</h2>
        <p>
          We will only keep your personal information for as long as it is necessary for the purposes set out in
          this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax,
          accounting, or other legal requirements). No purpose in this notice will require us to keep your personal
          information for longer than the period of time in which users have an account with us plus 90 days.
        </p>
        <p>
          When we have no ongoing legitimate business need to process your personal information, we will either
          delete or anonymise such information, or, if this is not possible, then we will securely store your
          personal information and isolate it from any further processing until deletion is possible.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">8. How Do We Keep Your Information Safe?</h2>
        <p>
          We have implemented appropriate and reasonable technical and organisational security measures designed to
          protect the security of any personal information we process. In particular:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>All Stripe OAuth access tokens are encrypted with AES-256 before being stored in our database.</li>
          <li>Tokens are decrypted only at runtime in a secure server context — never exposed client-side.</li>
          <li>Our database (Supabase PostgreSQL) enforces Row-Level Security (RLS) on every table, ensuring users can only access their own data.</li>
          <li>All connections to our API and Services use TLS/HTTPS encryption in transit.</li>
        </ul>
        <p>
          Despite our safeguards and efforts to secure your information, no electronic transmission over the
          Internet or information storage technology can be guaranteed to be 100% secure. Although we will do our
          best to protect your personal information, transmission of personal information to and from our Services
          is at your own risk.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">9. Do We Collect Information from Minors?</h2>
        <p>
          We do not knowingly collect data from or market to children under 18 years of age. By using the Services,
          you represent that you are at least 18, or that you are the parent or guardian of such a minor and
          consent to such minor dependent&apos;s use of the Services. If we learn that personal information from
          users less than 18 years of age has been collected, we will deactivate the account and take reasonable
          measures to promptly delete such data from our records. If you become aware of any data we may have
          collected from children under age 18, please contact us at{' '}
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">10. What Are Your Privacy Rights?</h2>
        <p>
          Depending on your location, you may have certain rights under applicable privacy law. These may include
          the right to (i) request access and obtain a copy of your personal information, (ii) request
          rectification or erasure, (iii) restrict the processing of your personal information, (iv) if applicable,
          to data portability, and (v) not be subject to automated decision-making.
        </p>
        <p>
          <strong>Withdrawing your consent.</strong> If we are relying on your consent to process your personal
          information, you have the right to withdraw your consent at any time. You can withdraw your consent at
          any time by contacting us at{' '}
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>.
        </p>
        <p>
          <strong>Opting out of marketing.</strong> You can unsubscribe from our marketing emails at any time by
          clicking the unsubscribe link in any marketing email we send you, or by contacting us.
        </p>
        <p>
          <strong>Account Information.</strong> If you would at any time like to review or change the information
          in your account or terminate your account, you can log in to your account settings or contact us. Upon
          your request to terminate your account, we will deactivate or delete your account and information from
          our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot
          problems, assist with any investigations, enforce our legal terms, and/or comply with applicable legal
          requirements.
        </p>
        <p>
          <strong>EEA or UK complaint.</strong> If you are located in the EEA or UK and you believe we are
          unlawfully processing your personal information, you also have the right to complain to your local data
          protection supervisory authority.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">11. Controls for Do-Not-Track Features</h2>
        <p>
          Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track
          (&quot;DNT&quot;) feature or setting you can activate to signal your privacy preference not to have data about
          your online browsing activities monitored and collected. At this stage, no uniform technology standard
          for recognising and implementing DNT signals has been finalised. As such, we do not currently respond
          to DNT browser signals or any other mechanism that automatically communicates your choice not to be
          tracked online. If a standard for online tracking is adopted that we must follow in the future, we will
          inform you about that practice in a revised version of this Privacy Notice.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">12. Do United States Residents Have Specific Privacy Rights?</h2>
        <p>
          If you are a resident of California or certain other US states, you are granted specific rights
          regarding access to your personal information. The table below lists the categories of personal
          information we may have collected in the past twelve months and whether we have collected them:
        </p>

        <div className="overflow-x-auto mt-4">
          <table className="w-full border border-gray-200 text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Category</th>
                <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Examples</th>
                <th className="border border-gray-200 px-3 py-2 text-center font-semibold text-gray-700">Collected</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-3 py-2">A. Identifiers</td>
                <td className="border border-gray-200 px-3 py-2">Contact details, real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, IP address, email address, and account name</td>
                <td className="border border-gray-200 px-3 py-2 text-center">YES</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="border border-gray-200 px-3 py-2">B. Personal information as defined in the California Customer Records statute</td>
                <td className="border border-gray-200 px-3 py-2">Name, contact information, education, employment, employment history, and financial information</td>
                <td className="border border-gray-200 px-3 py-2 text-center">YES</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">C. Protected classification characteristics under state or federal law</td>
                <td className="border border-gray-200 px-3 py-2">Gender, age, date of birth, race and ethnicity, national origin, marital status, and other demographic data</td>
                <td className="border border-gray-200 px-3 py-2 text-center">NO</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="border border-gray-200 px-3 py-2">D. Commercial information</td>
                <td className="border border-gray-200 px-3 py-2">Transaction information, purchase history, financial details, and payment information</td>
                <td className="border border-gray-200 px-3 py-2 text-center">YES</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">E. Biometric information</td>
                <td className="border border-gray-200 px-3 py-2">Fingerprints and voiceprints</td>
                <td className="border border-gray-200 px-3 py-2 text-center">NO</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="border border-gray-200 px-3 py-2">F. Internet or other similar network activity</td>
                <td className="border border-gray-200 px-3 py-2">Browsing history, search history, online behaviour, interest data, and interactions with our and other websites, applications, systems, and advertisements</td>
                <td className="border border-gray-200 px-3 py-2 text-center">YES</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">G. Geolocation data</td>
                <td className="border border-gray-200 px-3 py-2">Device location</td>
                <td className="border border-gray-200 px-3 py-2 text-center">NO</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="border border-gray-200 px-3 py-2">H. Audio, electronic, sensory, or similar information</td>
                <td className="border border-gray-200 px-3 py-2">Images and audio, video or call recordings created in connection with our business activities</td>
                <td className="border border-gray-200 px-3 py-2 text-center">NO</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">I. Professional or employment-related information</td>
                <td className="border border-gray-200 px-3 py-2">Business contact details in order to provide you our Services at a business level or job title, work history, and professional qualifications</td>
                <td className="border border-gray-200 px-3 py-2 text-center">NO</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="border border-gray-200 px-3 py-2">J. Education Information</td>
                <td className="border border-gray-200 px-3 py-2">Student records and directory information</td>
                <td className="border border-gray-200 px-3 py-2 text-center">NO</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">K. Inferences drawn from collected personal information</td>
                <td className="border border-gray-200 px-3 py-2">Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual&apos;s preferences and characteristics</td>
                <td className="border border-gray-200 px-3 py-2 text-center">NO</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="border border-gray-200 px-3 py-2">L. Sensitive personal information</td>
                <td className="border border-gray-200 px-3 py-2"></td>
                <td className="border border-gray-200 px-3 py-2 text-center">NO</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          We will use and retain the collected personal information as needed to provide the Services or for so
          long as the user has an account with us.
        </p>
        <p>
          <strong>California Shine the Light Law.</strong> California Civil Code Section 1798.83, also known as
          the &quot;Shine The Light&quot; law, permits our users who are California residents to request and obtain from
          us, once a year and free of charge, information about categories of personal information (if any) we
          disclosed to third parties for direct marketing purposes and the names and addresses of all third parties
          with which we shared personal information in the immediately preceding calendar year. If you are a
          California resident and would like to make such a request, please submit your request in writing to us
          at{' '}
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">13. Stripe API Key Security</h2>
        <p>
          Unchurnly connects to your Stripe account using Stripe Connect OAuth. We do not store your raw Stripe
          secret keys. The OAuth access token granted by Stripe is immediately encrypted using AES-256 symmetric
          encryption before being written to our database. The encryption key is stored exclusively as an
          environment variable in our server infrastructure and is never committed to source control or exposed
          client-side.
        </p>
        <p>
          Decryption occurs only at runtime within server-side code paths (server actions or API routes) when an
          authorised request from an authenticated user triggers a Stripe API call. The decrypted token is never
          logged, cached to disk, or transmitted in plaintext.
        </p>
        <p>
          If you believe your Stripe connection has been compromised, you can immediately revoke Unchurnly&apos;s
          access from your Stripe Dashboard under Settings &rarr; Connect &rarr; Connected Applications. Contact
          us at{' '}
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>{' '}
          so we can assist with any further steps.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">14. Do We Make Updates to This Notice?</h2>
        <p>
          We may update this Privacy Notice from time to time. The updated version will be indicated by an updated
          &quot;Last updated&quot; date at the top of this Privacy Notice. If we make material changes to this Privacy Notice,
          we may notify you either by prominently posting a notice of such changes or by directly sending you a
          notification. We encourage you to review this Privacy Notice frequently to be informed of how we are
          protecting your information.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">15. How Can You Contact Us About This Notice?</h2>
        <p>
          If you have questions or comments about this notice, you may contact us at:
        </p>
        <p>
          Mohammad Khushab Khan (doing business as Unchurnly)<br />
          BEML Layout, Brookefield<br />
          Bengaluru, Karnataka 560037<br />
          India<br />
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">16. How Can You Review, Update, or Delete the Data We Collect from You?</h2>
        <p>
          Based on the applicable laws of your country, you may have the right to request access to the personal
          information we collect from you, details about how we have processed it, correct inaccuracies, or delete
          your personal information. You may also have the right to withdraw your consent to our processing of
          your personal information. These rights may be limited in some circumstances by applicable law.
        </p>
        <p>
          To request to review, update, or delete your personal information, please email us at{' '}
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>.
          We will respond to your request within 30 days.
        </p>
      </div>
    </div>
  )
}
