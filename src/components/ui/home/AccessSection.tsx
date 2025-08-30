// components/AccessSection.tsx
"use client";

export default function AccessSection() {
  return (
    <section className="py-20 border-t border-[#d6d6d6] bg-white">
      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
        <h2 className="text-2xl font-bold tracking-widest mb-10">ACCESS</h2>

        <div className="space-y-4 text-sm text-[#222]">
          <p>SAMPLE STORE</p>
          <p>〒150-0001 東京都渋谷区○○1-2-3</p>
          <p>営業時間：12:00 - 20:00（火曜定休）</p>
        </div>

        <div className="mt-10">
          <div className="w-full h-64 md:h-96">
            <iframe
              src="https://maps.google.com/maps?q=渋谷駅&t=&z=13&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
