import React from 'react';

function Policy() {
  return (
    <>
      <div className="bg-cover bg-center h-[30vh] sm:h-[40vh] md:h-[50vh]" style={{backgroundImage: "url('/img/room4.avif')"}}>
        <h3 className="text-center text-3xl sm:text-4xl md:text-5xl py-20 sm:py-30 md:py-40 text-white">Privacy Policy</h3>
      </div>
      <div className="px-4 sm:px-8 md:px-16 lg:px-40 py-8">
        <div className="font-bold py-5">Effective Date: July 31, 2024</div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">1. Introduction</h3>
          <p className="text-base sm:text-lg">We collect, use, process, and share personal data in accordance with privacy laws to ensure the implementation and enforcement of your data protection rights. Employing technical and organizational solutions, we comply with relevant legislation on personal data, privacy, and security in the countries we operate. This Privacy Policy outlines the fundamental rules and principles governing the processing of your personal data, elucidating our responsibilities in the process.</p>
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">2. Contact Information:</h3>
          <p className="text-base sm:text-lg">
            MOA Data Directs<br />
            Registration number: 516153194<br />
            Registered address: 2 Kaufmann St, Tel Aviv, Israel<br />
            Email: info@moahotelsprices.com
          </p>
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">3. TERMS USED AS LEGAL GUIDELINES:</h3>
          <p className="text-base sm:text-lg">The processing of your personal data relies on legal bases, primarily consent and legitimate interests. Consent refers to your explicit agreement for a specific purpose, while legitimate interests justify the necessity of data processing, ensuring a balance with your rights. Some laws may specify alternative legal grounds, and we adhere to them when applicable.</p>
        </div>
      </div>
    </>
  );
}

export default Policy;