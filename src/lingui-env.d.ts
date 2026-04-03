declare module "*.po" {
	export const messages: import("@lingui/core").Messages;
}

declare module "*.po?lingui" {
	export const messages: import("@lingui/core").Messages;
}
