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
import {
  formatSalonPickProductPrice,
  getSalonPickProductSexOrDefault,
} from "@/utils/salonPickProducts";
import {
  SALON_PICK_PRODUCT_HAIR_CONCERNS,
  SALON_PICK_PRODUCT_TREATMENT_TYPES,
} from "@/constants/salonPickProducts";

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
  fallbackText,
  imageAlt,
}: {
  imageUrl?: string;
  productName: string;
  onOpen: () => void;
  fallbackText?: string;
  imageAlt?: string;
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
          alt={imageAlt ?? "상품 썸네일"}
          className="h-full w-full object-cover"
          onError={() => {
            if (src !== originalSrc) setSrc(originalSrc);
          }}
        />
      ) : (
        (fallbackText ?? "썸네일")
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

function getTargetingOptionText(
  values: readonly string[] | null | undefined,
  allOptions: readonly string[],
) {
  if (!values?.length) return "전체";

  const isAllSelected = allOptions.every((option) => values.includes(option));
  if (isAllSelected) return "전체";

  if (values.length <= 2) return values.join(", ");

  return `${values.slice(0, 2).join(", ")} 외 ${values.length - 2}`;
}

function getTargetingOptionTitle(
  values: readonly string[] | null | undefined,
  allOptions: readonly string[],
) {
  return (values?.length ? values : allOptions).join(", ");
}

function TargetingSummaryCell({
  text,
  title,
}: {
  text: string;
  title: string;
}) {
  return (
    <span className="block max-w-full truncate" title={title}>
      {text}
    </span>
  );
}

type PreviewImage = {
  imageUrl?: string | null;
  title?: string;
};

export default function SalonPickProductsTable({
  data,
  isPending = false,
  onChangeActive,
  onDelete,
  className,
}: SalonPickProductsTableProps) {
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);
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
        cell: (info) => formatSalonPickProductPrice(info.getValue() as string),
        enableSorting: false,
      },
      {
        accessorKey: "discountPrice",
        header: "할인가",
        size: 80,
        cell: (info) => formatSalonPickProductPrice(info.getValue() as string),
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
              onOpen={() =>
                setPreviewImage({
                  imageUrl: product.imageUrl,
                  title: product.productName,
                })
              }
            />
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "bannerImageUrl",
        header: "배너",
        size: 80,
        cell: (info) => {
          const product = info.row.original;
          return (
            <ProductThumbnail
              imageUrl={product.bannerImageUrl ?? undefined}
              productName={product.productName}
              fallbackText="없음"
              imageAlt="배너 이미지"
              onOpen={() =>
                setPreviewImage({
                  imageUrl: product.bannerImageUrl,
                  title: `${product.productName} 배너`,
                })
              }
            />
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "sex",
        header: "노출성별",
        size: 80,
        cell: (info) => getSalonPickProductSexOrDefault(info.getValue()),
        enableSorting: false,
      },
      {
        accessorKey: "hairConcerns",
        header: "관련 고민",
        size: 170,
        cell: (info) => {
          const values = info.getValue<string[] | undefined>();
          return (
            <TargetingSummaryCell
              text={getTargetingOptionText(
                values,
                SALON_PICK_PRODUCT_HAIR_CONCERNS,
              )}
              title={getTargetingOptionTitle(
                values,
                SALON_PICK_PRODUCT_HAIR_CONCERNS,
              )}
            />
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "preferredTreatmentTypes",
        header: "시술종류",
        size: 180,
        cell: (info) => {
          const values = info.getValue<string[] | undefined>();
          return (
            <TargetingSummaryCell
              text={getTargetingOptionText(
                values,
                SALON_PICK_PRODUCT_TREATMENT_TYPES,
              )}
              title={getTargetingOptionTitle(
                values,
                SALON_PICK_PRODUCT_TREATMENT_TYPES,
              )}
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
  const tableMinWidth = useMemo(
    () => columns.reduce((total, column) => total + (column.size ?? 0), 0),
    [columns],
  );
  const previewOriginalImageUrl = previewImage?.imageUrl
    ? parseImageUrl(stripImageVariantParams(previewImage.imageUrl))
    : "";

  return (
    <div className={cn("salon-pick-products-table-wrapper", className)}>
      <div className="overflow-x-auto">
        <div style={{ minWidth: tableMinWidth }}>
          <CommonTable<ISalonPickProduct> data={data} columns={columns} />
        </div>
      </div>
      <ImageSwiper
        images={
          previewOriginalImageUrl
            ? [
                {
                  src: previewOriginalImageUrl,
                  title: previewImage?.title,
                  deletable: false,
                },
              ]
            : []
        }
        initialIndex={0}
        open={Boolean(previewOriginalImageUrl)}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}
