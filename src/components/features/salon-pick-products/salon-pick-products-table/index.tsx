"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import CommonTable from "@/components/shared/common-table";
import ImageSwiper from "@/components/shared/image-swiper";
import { Button } from "@/components/ui/button";
import { ISalonPickProduct } from "@/models/salonPickProducts";
import { cn } from "@/lib/utils";
import { parseImageUrl, stripImageVariantParams } from "@/utils/image";
import { formatSalonPickProductPrice } from "@/utils/salonPickProducts";

interface SalonPickProductsTableProps {
  data: ISalonPickProduct[];
  isPending?: boolean;
  onChangeActive: (product: ISalonPickProduct, isActive: boolean) => void;
  onDelete: (product: ISalonPickProduct) => void;
  className?: string;
}

function ProductThumbnail({
  imageUrl,
  productName,
  onOpen,
}: {
  imageUrl?: string;
  productName: string;
  onOpen: () => void;
}) {
  const originalSrc = imageUrl
    ? parseImageUrl(stripImageVariantParams(imageUrl))
    : "";
  const [src, setSrc] = useState(originalSrc);

  useEffect(() => {
    setSrc(originalSrc);
  }, [originalSrc]);

  return (
    <button
      type="button"
      disabled={!src}
      aria-label={`${productName} 이미지 크게 보기`}
      className={cn(
        "flex h-[40px] w-[40px] items-center justify-center overflow-hidden rounded-4 bg-[#d7ddeb] text-[11px] text-[#3f4658]",
        src && "cursor-pointer",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
    >
      {src ? (
        <img
          src={src}
          alt="상품 썸네일"
          className="h-full w-full object-cover"
          onError={() => {
            if (src !== originalSrc) setSrc(originalSrc);
          }}
        />
      ) : (
        "썸네일"
      )}
    </button>
  );
}

function ProductActiveSwitch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={checked}
      className={cn(
        "relative h-[24px] w-[48px] rounded-full transition-colors",
        checked ? "bg-[#2f72ff]" : "bg-[#b9bcc8]",
        disabled && "cursor-not-allowed opacity-60",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onChange(!checked);
      }}
    >
      <span
        className={cn(
          "absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-[left]",
          checked ? "left-[27px]" : "left-[3px]",
        )}
      />
    </button>
  );
}

function formatClickCount(clickCount?: number | null) {
  return typeof clickCount === "number"
    ? clickCount.toLocaleString("ko-KR")
    : "-";
}

export default function SalonPickProductsTable({
  data,
  isPending = false,
  onChangeActive,
  onDelete,
  className,
}: SalonPickProductsTableProps) {
  const [previewProduct, setPreviewProduct] =
    useState<ISalonPickProduct | null>(null);
  const columns = useMemo<ColumnDef<ISalonPickProduct>[]>(
    () => [
      {
        accessorKey: "id",
        header: "No.",
        size: 48,
        cell: (info) => info.row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "productName",
        header: "제품명",
        size: 170,
        cell: (info) => info.getValue(),
        enableSorting: false,
      },
      {
        accessorKey: "productLinkUrl",
        header: "링크",
        size: 150,
        cell: (info) => info.getValue(),
        enableSorting: false,
      },
      {
        accessorKey: "originalPrice",
        header: "원가",
        size: 80,
        cell: (info) =>
          formatSalonPickProductPrice(info.getValue() as string),
        enableSorting: false,
      },
      {
        accessorKey: "discountPrice",
        header: "할인가",
        size: 80,
        cell: (info) =>
          formatSalonPickProductPrice(info.getValue() as string),
        enableSorting: false,
      },
      {
        accessorKey: "chipText",
        header: "칩문구",
        size: 100,
        cell: (info) => info.getValue(),
        enableSorting: false,
      },
      {
        accessorKey: "imageUrl",
        header: "이미지",
        size: 80,
        cell: (info) => {
          const product = info.row.original;
          return (
            <ProductThumbnail
              imageUrl={product.imageUrl}
              productName={product.productName}
              onOpen={() => setPreviewProduct(product)}
            />
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "isActive",
        header: "활성화",
        size: 80,
        cell: (info) => {
          const product = info.row.original;
          return (
            <ProductActiveSwitch
              checked={Boolean(info.getValue())}
              disabled={isPending}
              onChange={(checked) => onChangeActive(product, checked)}
            />
          );
        },
        enableSorting: false,
      },
      {
        id: "totalClickCount",
        header: "전체 클릭수",
        size: 100,
        cell: (info) => formatClickCount(info.row.original.clickCount),
        enableSorting: false,
      },
      {
        id: "previousDayClickCount",
        header: "전일 클릭수",
        size: 100,
        cell: (info) =>
          formatClickCount(
            info.row.original.yesterdaySalonPickProductCount?.dailyClickCount ??
              0,
          ),
        enableSorting: false,
      },
      {
        id: "management",
        header: "관리",
        size: 140,
        cell: (info) => {
          const product = info.row.original;
          return (
            <div className="flex items-center justify-center gap-[6px]">
              <Button
                asChild
                type="button"
                variant="outline"
                size="sm"
                className="h-[27px] rounded-4 border-primary-foreground px-[10px] text-primary-foreground"
              >
                <Link href={`/salon-pick-products/${product.id}`}>수정</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-[27px] rounded-4 border-[#ff4d4f] px-[10px] text-[#ff4d4f] hover:bg-white"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(product);
                }}
              >
                삭제
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [isPending, onChangeActive, onDelete],
  );
  const previewOriginalImageUrl = previewProduct?.imageUrl
    ? parseImageUrl(stripImageVariantParams(previewProduct.imageUrl))
    : "";

  return (
    <div className={cn("salon-pick-products-table-wrapper", className)}>
      <CommonTable<ISalonPickProduct> data={data} columns={columns} />
      <ImageSwiper
        images={
          previewOriginalImageUrl
            ? [
                {
                  src: previewOriginalImageUrl,
                  title: previewProduct?.productName,
                  deletable: false,
                },
              ]
            : []
        }
        initialIndex={0}
        open={Boolean(previewOriginalImageUrl)}
        onClose={() => setPreviewProduct(null)}
      />
    </div>
  );
}
