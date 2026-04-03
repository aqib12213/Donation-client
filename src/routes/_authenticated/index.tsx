import { Trans, useLingui } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowUpRight,
	BellIcon,
	EllipsisIcon,
	LightbulbIcon,
	SearchIcon,
	TrendingDown,
	UserPlus,
} from "lucide-react";
import { LanguageSwitch } from "@/components/language-switch";
import { Header } from "@/components/layout/header";
import { ThemeSwitch } from "@/components/theme-switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/")({ component: App });

function App() {
	const { t: translate } = useLingui();

	const cards = [
		{
			id: "sales-cost",
			title: translate`Total Sales & Cost`,
			subtitle: translate`Last 60 days`,
			value: "$956.82k",
			badge: {
				color:
					"bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
				icon: ArrowUpRight,
				iconColor: "text-green-500",
				text: "+5.4%",
			},
			subtextStrong: "+8.20k",
			subtextMuted: translate`vs prev. 60 days`,
			subtextColor: "text-green-600",
		},
		{
			id: "new-customers",
			title: translate`New Customers`,
			subtitle: translate`This quarter`,
			value: "1,245",
			badge: {
				color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
				icon: UserPlus,
				iconColor: "text-blue-500",
				text: "+3.2%",
			},
			subtextStrong: "+39",
			subtextMuted: translate`vs last quarter`,
			subtextColor: "text-blue-600",
		},
		{
			id: "churn-rate",
			title: translate`Churn Rate`,
			subtitle: translate`Last 30 days`,
			value: "2.8%",
			badge: {
				color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
				icon: TrendingDown,
				iconColor: "text-red-500",
				text: "-1.1%",
			},
			subtextStrong: "-0.3%",
			subtextMuted: translate`vs prev. 30 days`,
			subtextColor: "text-red-500",
		},
	] as const;

	const recentTransactions = Array.from({ length: 9 }, (_, index) => ({
		id: index + 1,
		initials: "CN",
		name: translate`Contractor Name`,
		category: translate`Subscription`,
		action: translate`Edit`,
	}));

	return (
		<>
			<Header className="border-b">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbPage>
								<Trans>Dashboard</Trans>
							</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<div className="ms-auto flex items-center space-x-4">
					<div className="relative hidden w-72 sm:block">
						<SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							aria-label={translate`Search`}
							className="pl-8"
							placeholder={translate`Search for something...`}
							type="search"
						/>
					</div>
					<LanguageSwitch />
					<ThemeSwitch />
					<Button
						aria-label={translate`Notifications`}
						size="icon-sm"
						variant="ghost"
					>
						<BellIcon />
					</Button>
					<Avatar size="sm">
						<AvatarFallback>JD</AvatarFallback>
					</Avatar>
				</div>
			</Header>

			<main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
				<div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
					<div className="space-y-1">
						<h1 className="font-heading font-semibold text-2xl tracking-tight md:text-3xl">
							<Trans>Financial overview for the current fiscal period.</Trans>
						</h1>
					</div>

					<section>
						<div className="grid overflow-hidden rounded-xl border border-border bg-background md:grid-cols-3">
							{cards.map((card) => (
								<Card
									className="rounded-none border-0 border-border @3xl:border-x border-y @3xl:border-y-0 shadow-none first:border-0 last:border-0"
									key={card.id}
								>
									<CardContent className="flex h-full flex-col justify-between space-y-6">
										{/* Title & Subtitle */}
										<div className="space-y-0.25">
											<div className="font-semibold text-foreground text-lg">
												{card.title}
											</div>
											<div className="text-muted-foreground text-sm">
												{card.subtitle}
											</div>
										</div>
										{/* Information */}
										<div className="flex flex-1 grow flex-col justify-between gap-1.5">
											{/* Value & Delta */}
											<div className="flex items-center gap-2">
												<span className="font-bold text-3xl tracking-tight">
													{card.value}
												</span>
												<Badge
													className={`${card.badge.color} flex items-center gap-1 rounded-full px-2 py-1 font-medium text-sm shadow-none`}
												>
													<card.badge.icon
														className={`h-3 w-3 ${card.badge.iconColor}`}
													/>
													{card.badge.text}
												</Badge>
											</div>
											{/* Subtext */}
											<div className="text-sm">
												<span className={`font-medium ${card.subtextColor}`}>
													{card.subtextStrong}{" "}
													<span className="font-normal text-muted-foreground">
														{card.subtextMuted}
													</span>
												</span>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					<section className="grid gap-6 lg:grid-cols-[1fr_320px]">
						<div className="space-y-3">
							<div className="flex items-center justify-between gap-2">
								<h2 className="font-heading font-semibold text-lg tracking-tight md:text-2xl">
									<Trans>Recent Transactions</Trans>
								</h2>
								<Button
									className="text-muted-foreground"
									size="sm"
									variant="ghost"
								>
									<Trans>View all</Trans>
								</Button>
							</div>

							<Card>
								<CardContent className="px-0">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="px-4 text-muted-foreground">
													<Trans>Name</Trans>
												</TableHead>
												<TableHead className="text-muted-foreground">
													<Trans>Table cell</Trans>
												</TableHead>
												<TableHead className="text-muted-foreground">
													<Trans>Edit</Trans>
												</TableHead>
												<TableHead className="text-right text-muted-foreground">
													<span className="sr-only">
														<Trans>Actions</Trans>
													</span>
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{recentTransactions.map((row, index) => (
												<TableRow key={row.id}>
													<TableCell className="px-4">
														<div className="flex items-center gap-3">
															<Avatar
																className={index === 7 ? "bg-muted" : undefined}
																size="sm"
															>
																<AvatarFallback>{row.initials}</AvatarFallback>
															</Avatar>
															<span className="font-medium">{row.name}</span>
														</div>
													</TableCell>
													<TableCell>{row.category}</TableCell>
													<TableCell>
														<Button size="sm" variant="ghost">
															{row.action}
														</Button>
													</TableCell>
													<TableCell className="text-right">
														<Button size="icon-xs" variant="ghost">
															<EllipsisIcon />
														</Button>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						</div>

						<div className="space-y-3">
							<h2 className="font-heading font-semibold text-xl tracking-tight md:text-2xl">
								<Trans>Insights</Trans>
							</h2>

							<Card>
								<CardHeader>
									<CardAction className="justify-self-start">
										<LightbulbIcon className="size-4 text-muted-foreground" />
									</CardAction>
									<CardTitle className="font-medium text-muted-foreground text-xs">
										<Trans>Efficiency Alert</Trans>
									</CardTitle>
								</CardHeader>
								<CardContent className="text-muted-foreground text-sm leading-relaxed">
									<Trans>
										Subscription costs increased by 18% this month. Consider
										auditing unused SaaS licenses.
									</Trans>
								</CardContent>
							</Card>

							<Card className="bg-foreground text-background ring-0">
								<CardHeader>
									<CardTitle className="font-medium text-background/70 text-xs">
										<Trans>Projected Growth</Trans>
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-end gap-1.5">
										<div className="h-6 w-8 rounded-sm bg-background/50" />
										<div className="h-8 w-8 rounded-sm bg-background/60" />
										<div className="h-9 w-8 rounded-sm bg-background/70" />
										<div className="h-11 w-8 rounded-sm bg-background/95" />
										<div className="h-9 w-8 rounded-sm bg-background/60" />
									</div>
									<p className="text-background/85 text-sm leading-relaxed">
										<Trans>
											You are on track to exceed Q4 targets by 6.2% if current
											spending holds.
										</Trans>
									</p>
								</CardContent>
							</Card>
						</div>
					</section>
				</div>
			</main>
		</>
	);
}
