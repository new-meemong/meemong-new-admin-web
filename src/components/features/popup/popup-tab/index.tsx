"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePopupContext } from "@/components/contexts/popup-context";
import SwitchButton from "@/components/shared/switch-button";
import {
  POPUP_TYPE_OPTIONS,
  PopupUserType,
  DEFAULT_POPUP_TYPE_BY_USER_TYPE,
  USER_TYPE_OPTIONS,
} from "@/constants/popup";

interface PopupTabProps {
  className?: string;
}

function PopupTab({ className, ...props }: PopupTabProps) {
  const { popupTabValues, setPopupTabValues } = usePopupContext();

  const handleClick = useCallback(
    (value: string) => {
      setPopupTabValues({
        ...popupTabValues,
        popupType: value,
      });
    },
    [popupTabValues],
  );

  return (
    <div className={cn("popups-tab flex gap-[5px]", className)} {...props}>
      <SwitchButton<PopupUserType>
        className={"mr-[20px]"}
        options={USER_TYPE_OPTIONS}
        value={popupTabValues.userType}
        onChange={(value) => {
          setPopupTabValues({
            ...popupTabValues,
            userType: value,
            popupType: DEFAULT_POPUP_TYPE_BY_USER_TYPE[value],
          });
        }}
      />
      {POPUP_TYPE_OPTIONS[popupTabValues.userType as PopupUserType] &&
        POPUP_TYPE_OPTIONS[popupTabValues.userType as PopupUserType]?.map(
          (popupType, index) => (
            <Button
              key={`popups-tab-${index}`}
              className={cn(
                "w-[126px]",
                popupTabValues.popupType === popupType.value &&
                  "bg-secondary-background text-secondary-foreground hover:bg-secondary-background",
              )}
              variant={"outline"}
              value={popupType.value}
              onClick={() => handleClick(popupType.value)}
            >
              {popupType.label}
            </Button>
          ),
        )}
    </div>
  );
}

export default PopupTab;
