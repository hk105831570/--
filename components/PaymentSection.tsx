"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

interface PaymentSectionProps {
  planName: string;
  price: string;
}

function QrImage({ src, alt, width, height, label }: { src: string; alt: string; width: number; height: number; label: string }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className="mx-auto flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50" style={{ width, height }}>
        <div className="text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-xs text-gray-500">{label}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="mx-auto animate-pulse rounded-lg bg-gray-100" style={{ width, height }} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`mx-auto rounded-lg ${loaded ? "" : "hidden"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </>
  );
}

export default function PaymentSection({ planName, price }: PaymentSectionProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-8 text-center sm:px-8">
      <h3 className="text-lg font-semibold text-gray-800">{planName}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{price}</p>

      <div className="mt-6">
        <QrImage
          src="/images/wechat-pay.jpg"
          alt="微信收款码"
          width={240}
          height={240}
          label="微信收款码"
        />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-gray-500">
        付款后，请截图发送至顾问微信
        <br />
        30 分钟内发送完整处理建议书
      </p>

      <div className="mt-6">
        <QrImage
          src="/images/wechat-contact.jpg"
          alt="顾问微信"
          width={160}
          height={160}
          label="顾问微信二维码"
        />
      </div>
    </div>
  );
}
