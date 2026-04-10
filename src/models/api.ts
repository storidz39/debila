import { Complaint, ComplaintStatus } from "../types";

export type CreateComplaintRequest = {
  description: string;
  category?: string;
  is_anonymous: boolean;
  location: {
    lat: number;
    lng: number;
    address_text: string;
  };
  media_urls?: string[];
  video_url?: string;
};

export type ComplaintListResponse = {
  items: Complaint[];
};

export type UpdateComplaintStatusRequest = {
  status: ComplaintStatus;
  public_note?: string;
  internal_note?: string;
};

