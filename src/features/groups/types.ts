export interface Group {
  id: string
  owner_id: string
  name: string
  invite_code: string
  created_at: string
}

export interface GroupPreview {
  id: string
  name: string
}

export interface GroupMember {
  user_id: string
  full_name: string | null
  avatar_url: string | null
  is_owner: boolean
}

export interface GroupWithMembers extends Group {
  isOwner: boolean
  members: GroupMember[]
}
