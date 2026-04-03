import type { LinkProps } from "@tanstack/react-router";

interface User {
	avatar: string;
	email: string;
	name: string;
}

interface Team {
	logo: React.ElementType;
	name: string;
	plan: string;
}

interface BaseNavItem {
	badge?: string;
	icon?: React.ElementType;
	title: string;
}

type NavLink = BaseNavItem & {
	url: LinkProps["to"] | (string & {});
	items?: never;
};

type NavCollapsible = BaseNavItem & {
	items: (BaseNavItem & { url: LinkProps["to"] | (string & {}) })[];
	url?: never;
};

type NavItem = NavCollapsible | NavLink;

interface NavGroup {
	items: NavItem[];
	title: string;
}

interface SidebarData {
	navGroups: NavGroup[];
	teams: Team[];
	user: User;
}

export type { NavCollapsible, NavGroup, NavItem, NavLink, SidebarData };
