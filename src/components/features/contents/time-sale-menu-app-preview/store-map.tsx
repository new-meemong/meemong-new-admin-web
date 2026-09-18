"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

type NaverMapWindow = Window & {
  naver?: { maps: NaverMaps };
  navermap_authFailure?: () => void;
};

type NaverMap = { destroy: () => void };
type NaverMaps = {
  LatLng: new (lat: number, lng: number) => object;
  Map: new (element: HTMLElement, options: Record<string, unknown>) => NaverMap;
  Marker: new (options: Record<string, unknown>) => {
    setMap: (map: null) => void;
  };
};

export default function TimeSaleMenuStoreMap({
  lat,
  lng,
}: {
  lat: number | null | undefined;
  lng: number | null | undefined;
}) {
  const element = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const keyId = process.env.NEXT_PUBLIC_NAVER_MAP_KEY_ID;
  const valid =
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    Math.abs(lat) <= 90 &&
    typeof lng === "number" &&
    Number.isFinite(lng) &&
    Math.abs(lng) <= 180;

  useEffect(() => {
    if (!valid || !keyId) return;
    const target = window as NaverMapWindow;
    const previous = target.navermap_authFailure;
    const handleFailure = () => {
      setFailed(true);
      previous?.();
    };
    target.navermap_authFailure = handleFailure;
    return () => {
      if (target.navermap_authFailure === handleFailure)
        target.navermap_authFailure = previous;
    };
  }, [valid, keyId]);

  useEffect(() => {
    if (!ready || !valid || !element.current) return;
    const maps = (window as NaverMapWindow).naver?.maps;
    if (!maps) {
      setFailed(true);
      return;
    }
    let map: NaverMap | undefined;
    let marker: { setMap: (map: null) => void } | undefined;
    try {
      const position = new maps.LatLng(lat, lng);
      map = new maps.Map(element.current, {
        center: position,
        zoom: 17,
        draggable: false,
        scrollWheel: false,
        disableDoubleClickZoom: true,
        disableDoubleTapZoom: true,
        disableTwoFingerTapZoom: true,
        keyboardShortcuts: false,
        mapDataControl: true,
      });
      marker = new maps.Marker({ position, map, title: "업체위치" });
    } catch {
      setFailed(true);
    }
    return () => {
      marker?.setMap(null);
      map?.destroy();
    };
  }, [ready, valid, lat, lng]);

  const message = !valid
    ? "매장 위치 정보가 없습니다."
    : !keyId
      ? "네이버 지도 설정이 필요합니다."
      : failed
        ? "지도를 불러오지 못했습니다."
        : !ready
          ? "지도를 불러오는 중입니다."
          : "";
  return (
    <div
      className="relative mt-2 aspect-video overflow-hidden rounded-xl bg-[#F8F9FB]"
      aria-label="매장 위치 지도"
    >
      {valid && keyId && (
        <Script
          id="time-sale-menu-naver-map"
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(keyId)}`}
          onReady={() => setReady(true)}
          onError={() => setFailed(true)}
        />
      )}
      <div ref={element} className="h-full w-full" />
      {message && (
        <p
          role="status"
          className="absolute inset-0 flex items-center justify-center p-4 text-center text-[13px] text-[#99A2AD]"
        >
          {message}
        </p>
      )}
    </div>
  );
}
