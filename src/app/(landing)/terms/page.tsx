import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-16">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-block">
        ← Back to unchurnly.com
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2 mt-8">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: 14 June 2026</p>

      <div className="text-gray-600 text-sm leading-relaxed space-y-6">
        <p>
          We are Mohammad Khushab Khan (doing business as Unchurnly) (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our&quot;).
        </p>
        <p>
          We operate unchurnly.com, as well as any other related products and services that refer or link to these
          legal terms (the &quot;Legal Terms&quot;) (collectively, the &quot;Services&quot;).
        </p>
        <p>
          Unchurnly is a B2B SaaS platform that connects to your Stripe account to automate dunning emails,
          recover failed payments, and present cancel-flow offers to your subscribers.
        </p>
        <p>
          You can contact us by email at{' '}
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>{' '}
          or by mail to BEML Layout, Brookefield, Bengaluru, Karnataka 560037, India.
        </p>
        <p>
          These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf
          of an entity (&quot;you&quot;), and Mohammad Khushab Khan (doing business as Unchurnly), concerning your access
          to and use of the Services. You agree that by accessing the Services, you have read, understood, and
          agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN
          YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
        </p>
        <p>
          We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms at
          any time and for any reason. We will alert you about any changes by updating the &quot;Last updated&quot; date of
          these Legal Terms, and you waive any right to receive specific notice of each such change. It is your
          responsibility to periodically review these Legal Terms to stay informed of updates. You will be subject
          to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Legal
          Terms by your continued use of the Services after the date such revised Legal Terms are posted.
        </p>
        <p>
          The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not
          permitted to use or register for the Services.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">1. Our Services</h2>
        <p>
          The information provided when using the Services is not intended for distribution to or use by any person
          or entity in any jurisdiction or country where such distribution or use would be contrary to law or
          regulation or which would subject us to any registration requirement within such jurisdiction or country.
          Accordingly, those persons who choose to access the Services from other locations do so on their own
          initiative and are solely responsible for compliance with local laws, if and to the extent local laws are
          applicable.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">2. Intellectual Property Rights</h2>
        <p>
          <strong>Our intellectual property.</strong> We are the owner or the licensee of all intellectual property
          rights in our Services, including all source code, databases, functionality, software, website designs,
          audio, video, text, photographs, and graphics in the Services (collectively, the &quot;Content&quot;), as well as
          the trademarks, service marks, and logos contained therein (the &quot;Marks&quot;).
        </p>
        <p>
          Our Content and Marks are protected by copyright and trademark laws (and various other intellectual
          property rights and unfair competition laws) and treaties around the world.
        </p>
        <p>
          The Content and Marks are provided in or through the Services &quot;AS IS&quot; for your personal, non-commercial
          use or internal business purpose only.
        </p>
        <p>
          <strong>Your use of our Services.</strong> Subject to your compliance with these Legal Terms, including
          the &quot;PROHIBITED ACTIVITIES&quot; section below, we grant you a non-exclusive, non-transferable, revocable
          licence to access the Services and download or print a copy of any portion of the Content to which you
          have properly gained access, solely for your personal, non-commercial use or internal business purpose.
        </p>
        <p>
          If you wish to make any use of the Content or Marks other than as set out in this section, please address
          your request to:{' '}
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">3. User Representations</h2>
        <p>By using the Services, you represent and warrant that:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>All registration information you submit will be true, accurate, current, and complete.</li>
          <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
          <li>You have the legal capacity and you agree to comply with these Legal Terms.</li>
          <li>You are not a minor in the jurisdiction in which you reside.</li>
          <li>You will not access the Services through automated or non-human means, whether through a bot, script, or otherwise.</li>
          <li>You will not use the Services for any illegal or unauthorised purpose.</li>
          <li>Your use of the Services will not violate any applicable law or regulation.</li>
        </ul>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">4. User Registration</h2>
        <p>
          You may be required to register to use the Services. You agree to keep your password confidential and
          will be responsible for all use of your account and password. We reserve the right to remove, reclaim,
          or change a username you select if we determine, in our sole discretion, that such username is
          inappropriate, obscene, or otherwise objectionable.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">5. Purchases and Payment</h2>
        <p>We accept the following forms of payment: major debit and credit cards processed via Stripe.</p>
        <p>
          You agree to provide current, complete, and accurate purchase and account information for all purchases
          made via the Services. You further agree to promptly update account and payment information, including
          email address, payment method, and payment card expiration date, so that we can complete your
          transactions and contact you as needed.
        </p>
        <p>
          Unchurnly operates on a &quot;free until your first recovery&quot; model. Your $49/month subscription begins
          automatically the first time Unchurnly recovers a failed payment or prevents a cancellation on your
          behalf. Sales tax may be added to the price as deemed required by us. We may change prices at any time,
          with notice to you.
        </p>
        <p>
          You agree to pay all charges at the prices then in effect for your purchases, and you authorise us to
          charge your chosen payment provider for any such amounts upon placing your order. We reserve the right
          to correct any errors or mistakes in pricing, even if we have already requested or received payment.
        </p>
        <p>
          We reserve the right to refuse any order placed through the Services. We may, in our sole discretion,
          limit or cancel quantities purchased per person, per household, or per order. These restrictions may
          include orders placed by or under the same customer account, the same payment method, and/or orders that
          use the same billing or shipping address.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">6. Subscriptions</h2>
        <p>
          <strong>Billing and Renewal.</strong> Your subscription will continue and automatically renew unless
          cancelled. You consent to our charging your payment method on a recurring basis without requiring your
          prior approval for each recurring charge, until such time as you cancel the applicable order.
        </p>
        <p>
          <strong>Cancellation.</strong> You can cancel your subscription at any time by logging into your account,
          or by contacting us at{' '}
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>.
          Your cancellation will take effect at the end of the current paid term. If you have any questions or are
          unsatisfied with our Services, please email us at{' '}
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>.
        </p>
        <p>
          <strong>Fee Changes.</strong> We may, from time to time, make changes to the subscription fee and will
          communicate any price changes to you in accordance with applicable law.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">7. Prohibited Activities</h2>
        <p>
          You may not access or use the Services for any purpose other than that for which we make the Services
          available. The Services may not be used in connection with any commercial endeavours except those that
          are specifically endorsed or approved by us.
        </p>
        <p>As a user of the Services, you agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
          <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
          <li>Circumvent, disable, or otherwise interfere with security-related features of the Services.</li>
          <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
          <li>Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
          <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
          <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
          <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material that interferes with any party&apos;s uninterrupted use and enjoyment of the Services.</li>
          <li>Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</li>
          <li>Delete the copyright or other proprietary rights notice from any Content.</li>
          <li>Attempt to impersonate another user or person or use the username of another user.</li>
          <li>Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.</li>
          <li>Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating endeavour or commercial enterprise.</li>
        </ul>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">8. Services Management</h2>
        <p>
          We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal
          Terms; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law
          or these Legal Terms; (3) in our sole discretion and without limitation, refuse, restrict access to,
          limit the availability of, or disable (to the extent technologically feasible) any of your Contributions
          or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to
          remove from the Services or otherwise disable all files and content that are excessive in size or are
          in any way burdensome to our systems; and (5) otherwise manage the Services in a manner designed to
          protect our rights and property and to facilitate the proper functioning of the Services.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">9. Privacy Policy</h2>
        <p>
          We care about data privacy and security. Please review our{' '}
          <Link href="/privacy" className="underline hover:text-gray-900">Privacy Policy</Link>. By using the
          Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms.
          Please be advised the Services are hosted in the United States. If you access the Services from any
          other region of the world with laws or other requirements governing personal data collection, use, or
          disclosure that differ from applicable laws in the United States, then through your continued use of
          the Services, you are transferring your data to the United States, and you expressly consent to have
          your data transferred to and processed in the United States.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">10. Term and Termination</h2>
        <p>
          These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY
          OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE
          OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY
          PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION,
          WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION.
        </p>
        <p>
          If we terminate or suspend your account for any reason, you are prohibited from registering and creating
          a new account under your name, a fake or borrowed name, or the name of any third party, even if you may
          be acting on behalf of the third party. In addition to terminating or suspending your account, we reserve
          the right to take appropriate legal action, including without limitation pursuing civil, criminal, and
          injunctive redress.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">11. Modifications and Interruptions</h2>
        <p>
          We reserve the right to change, modify, or remove the contents of the Services at any time or for any
          reason at our sole discretion without notice. We also reserve the right to modify or discontinue all or
          part of the Services without notice at any time. We will not be liable to you or any third party for any
          modification, price change, suspension, or discontinuance of the Services.
        </p>
        <p>
          We cannot guarantee the Services will be available at all times. We may experience hardware, software,
          or other problems or need to perform maintenance related to the Services, resulting in interruptions,
          delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise
          modify the Services at any time or for any reason without notice to you. You agree that we have no
          liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use
          the Services during any downtime or discontinuance of the Services.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">12. Governing Law</h2>
        <p>
          These Legal Terms shall be governed by and defined following the laws of India. Unchurnly and yourself
          irrevocably consent that the courts of Bengaluru, Karnataka, India shall have exclusive jurisdiction to
          resolve any dispute which may arise in connection with these Legal Terms.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">13. Dispute Resolution</h2>
        <p>
          <strong>Informal Negotiations.</strong> To expedite resolution and control the cost of any dispute,
          controversy, or claim related to these Legal Terms (each a &quot;Dispute&quot; and collectively, the &quot;Disputes&quot;)
          brought by either you or us (individually, a &quot;Party&quot; and collectively, the &quot;Parties&quot;), the Parties agree
          to first attempt to negotiate any Dispute (except those Disputes expressly provided below) informally
          for at least 30 days before initiating arbitration. Such informal negotiations commence upon written
          notice from one Party to the other Party.
        </p>
        <p>
          <strong>Binding Arbitration.</strong> Any dispute arising out of or in connection with these Legal Terms,
          including any question regarding its existence, validity, or termination, shall be referred to and
          finally resolved by arbitration under the Arbitration and Conciliation Act, 1996. The number of
          arbitrators shall be one (1). The seat, or legal place, of arbitration shall be Bengaluru, Karnataka,
          India. The language of the proceedings shall be English. The governing law of these Legal Terms shall
          be the substantive law of India.
        </p>
        <p>
          <strong>Restrictions.</strong> The Parties agree that any arbitration shall be limited to the Dispute
          between the Parties individually. To the full extent permitted by law: (a) no arbitration shall be
          joined with any other proceeding; (b) there is no right or authority for any Dispute to be arbitrated
          on a class-action basis or to utilise class action procedures; and (c) there is no right or authority
          for any Dispute to be brought in a purported representative capacity on behalf of the general public
          or any other persons.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">14. Corrections</h2>
        <p>
          There may be information on the Services that contains typographical errors, inaccuracies, or omissions,
          including descriptions, pricing, availability, and various other information. We reserve the right to
          correct any errors, inaccuracies, or omissions and to change or update the information on the Services
          at any time, without prior notice.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">15. Disclaimer</h2>
        <p>
          THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES
          WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS
          OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE
          IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE
          NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES&apos; CONTENT OR THE
          CONTENT OF ANY WEBSITES OR MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY
          OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL
          INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE
          SERVICES, (3) ANY UNAUTHORISED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL
          INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF
          TRANSMISSION TO OR FROM THE SERVICES, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE
          TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY
          CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY
          CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">16. Limitations of Liability</h2>
        <p>
          IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR
          ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING
          LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN
          IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. NOTWITHSTANDING ANYTHING TO THE CONTRARY
          CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE
          ACTION, WILL AT ALL TIMES BE LIMITED TO THE LESSER OF THE AMOUNT PAID, IF ANY, BY YOU TO US DURING
          THE THREE (3) MONTHS PRIOR TO ANY CAUSE OF ACTION ARISING, OR $49 USD. CERTAIN US STATE LAWS AND
          INTERNATIONAL LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF
          CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS MAY
          NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">17. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of
          our respective officers, agents, partners, and employees, from and against any loss, damage, liability,
          claim, or demand, including reasonable attorneys&apos; fees and expenses, made by any third party due to or
          arising out of: (1) your Contributions; (2) use of the Services; (3) breach of these Legal Terms;
          (4) any breach of your representations and warranties set forth in these Legal Terms; (5) your violation
          of the rights of a third party, including but not limited to intellectual property rights; or (6) any
          overt harmful act toward any other user of the Services with whom you connected via the Services.
          Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive defence
          and control of any matter for which you are required to indemnify us, and you agree to cooperate, at
          your expense, with our defence of such claims. We will use reasonable efforts to notify you of any such
          claim, action, or proceeding which is subject to this indemnification upon becoming aware of it.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">18. User Data</h2>
        <p>
          We will maintain certain data that you transmit to the Services for the purpose of managing the
          performance of the Services, as well as data relating to your use of the Services. Although we perform
          regular routine backups of data, you are solely responsible for all data that you transmit or that
          relates to any activity you have undertaken using the Services. You agree that we shall have no liability
          to you for any loss or corruption of any such data, and you hereby waive any right of action against us
          arising from any such loss or corruption of such data.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">19. Contact Us</h2>
        <p>
          In order to resolve a complaint regarding the Services or to receive further information regarding use
          of the Services, please contact us at:
        </p>
        <p>
          Mohammad Khushab Khan (doing business as Unchurnly)<br />
          BEML Layout, Brookefield<br />
          Bengaluru, Karnataka 560037<br />
          India<br />
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>
        </p>
      </div>
    </div>
  )
}
