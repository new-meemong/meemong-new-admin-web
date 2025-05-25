import { Input } from "@/components/ui/input";
import { SelectBox } from "@/components/shared/select-box";

export default function DemoPage() {
  return (
    <div>
      <Input type={"text"} placeholder={"123"} />
      <Input type={"text"} size={"md"} />
      <SelectBox
        size={"sm"}
        options={[
          { label: "123", value: "sdf" },
          { label: "123", value: "sddf" },
        ]}
      />
      <SelectBox
        size={"md"}
        options={[
          { label: "123", value: "sdf" },
          { label: "123", value: "sddf" },
        ]}
      />
      <SelectBox
        size={"lg"}
        options={[
          { label: "123", value: "sdf" },
          { label: "123", value: "sddf" },
        ]}
      />
    </div>
  );
}
