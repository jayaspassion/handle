import { ProfileFormFields, type ProfileValues } from "./form";
import { PhotoUploader, ResumeUploader } from "./uploads";

type Props = {
  values: ProfileValues;
  avatarUrl: string | null;
  resumeUrl: string | null;
};

export default function ProfileSection({ values, avatarUrl, resumeUrl }: Props) {
  return (
    <div className="grid gap-5 md:grid-cols-[9rem_minmax(0,1fr)_12rem]">
      <PhotoUploader avatarUrl={avatarUrl} name={values.fullName} />
      <ProfileFormFields initial={values} />
      <ResumeUploader resumeUrl={resumeUrl} />
    </div>
  );
}
