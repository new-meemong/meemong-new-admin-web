import { CommonFormInput } from "@/components/shared/common-form/common-form-input";
import { CommonFormTextarea } from "@/components/shared/common-form/common-form-textarea";
import { CommonFormReadonly } from "@/components/shared/common-form/common-form-read-only";
import { CommonFormReadonlyRow } from "@/components/shared/common-form/common-form-read-only-row";
import { CommonFormSelectBox } from "@/components/shared/common-form/common-form-select-box";
import { CommonFormDate } from "@/components/shared/common-form/common-form-date";
import { CommonFormImage } from "@/components/shared/common-form/common-form-image";

export const CommonForm = {
  Input: CommonFormInput,
  Textarea: CommonFormTextarea,
  Readonly: CommonFormReadonly,
  SelectBox: CommonFormSelectBox,
  Date: CommonFormDate,
  Image: CommonFormImage,
  // 제목과 내용이 나란히 있는 형태
  ReadonlyRow: CommonFormReadonlyRow,
};
