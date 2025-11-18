import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useGetThunderAnnouncementByIdQuery } from "@/queries/thunderAnnouncements";

const thunderAnnouncementSchema = z.object({
  title: z.string(),
  createdAt: z.string(),
  selectedServices: z.array(z.string()),
  location: z.string(),
  timeCondition: z.string(),
  priceType: z.string(),
  description: z.string(),
  images: z.array(
    z.object({
      id: z.number(),
      imgUrl: z.string()
    })
  )
});

export type ThunderAnnouncementFormType = z.infer<typeof thunderAnnouncementSchema>;

export function useThunderAnnouncementForm(contentsId?: number) {
  const form = useForm<ThunderAnnouncementFormType>({
    resolver: zodResolver(thunderAnnouncementSchema),
    defaultValues: {
      title: "",
      createdAt: "",
      selectedServices: [],
      location: "",
      timeCondition: "",
      priceType: "",
      description: "",
      images: []
    }
  });

  const getThunderAnnouncementByIdQuery =
    useGetThunderAnnouncementByIdQuery(contentsId);

  useEffect(() => {
    if (getThunderAnnouncementByIdQuery.data) {
      form.reset({
        title: getThunderAnnouncementByIdQuery.data.title,
        createdAt: getThunderAnnouncementByIdQuery.data.createdAt,
        selectedServices: getThunderAnnouncementByIdQuery.data.selectedServices,
        location: getThunderAnnouncementByIdQuery.data.locations
          .map((location) => {
            const _location = [];
            if (location.upperRegion) {
              _location.push(location.upperRegion);
            }
            if (location.lowerRegion) {
              _location.push(location.lowerRegion);
            }
            return _location.join(" ");
          })
          .join(", "),
        timeCondition: getThunderAnnouncementByIdQuery.data.timeConditions
          .map((timeCondition) => timeCondition.conditionType)
          .join(", "),
        priceType: getThunderAnnouncementByIdQuery.data.priceType,
        description: getThunderAnnouncementByIdQuery.data.description,
        images: getThunderAnnouncementByIdQuery.data.images
      });
    }
  }, [getThunderAnnouncementByIdQuery.data, form]);

  return {
    form,
    getThunderAnnouncementByIdQuery
  };
}

