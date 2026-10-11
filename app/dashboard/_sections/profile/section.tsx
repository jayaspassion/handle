import { ProfileForm, type ProfileValues } from "./form";

type Props = {
  values: ProfileValues;
  avatarUrl: string | null;
  resumeUrl: string | null;
};

export default function ProfileSection({ values, avatarUrl, resumeUrl }: Props) {
  return (
    <ProfileForm initial={values} avatarUrl={avatarUrl} resumeUrl={resumeUrl} />
  );
}
