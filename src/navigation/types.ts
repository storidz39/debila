import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type MainStackParamList = {
  MainTabs: undefined;
  ComplaintDetail: { complaintId: string };
  AddDepartment: { departmentId?: string } | undefined;
  SecuritySettings: undefined;
  EditProfileSettings: undefined;
  LanguageSettings: undefined;
  PrivacySettings: undefined;
  AboutPlatform: undefined;
};

export type MainStackNav = NativeStackNavigationProp<MainStackParamList>;
