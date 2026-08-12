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

/** Mirrors get_group_leaderboard's return row. Profit/rate fields are null when the member hid that stat, or (win_rate only) when they have zero decisive bets — the RPC doesn't distinguish the two. */
export interface LeaderboardRow {
  member_id: string
  full_name: string | null
  avatar_url: string | null
  currency: string
  overall_profit: number | null
  week_profit: number | null
  month_profit: number | null
  today_profit: number | null
  win_rate: number | null
}
