<script lang="ts">
	let { user = null } = $props();

	let accountOpen = $state(false);
	let mobileOpen = $state(false);

	function toggleAccount() {
		accountOpen = !accountOpen;
	}

	function closeMenus() {
		accountOpen = false;
		mobileOpen = false;
	}
</script>

<nav class="navbar">
	<div class="nav-inner">
		<a href="/" class="brand" onclick={closeMenus}>
			<span class="brand-mark">D</span>
			<span class="brand-name">DOGFOOD</span>
		</a>

		<div class="desktop-nav">
			<a href="/events">Events</a>
			<a href="/projects">Gallery</a>

			{#if user?.role === 'judge'}
				<a href="/judging">Judging</a>
			{/if}

			{#if user?.role === 'organizer' || user?.role === 'admin'}
				<a href="/events/manage">Manage</a>
			{/if}
		</div>

		<div class="desktop-actions">
			{#if user}
				<div class="account">
					<button
						class="account-button"
						type="button"
						aria-label="Open account menu"
						aria-expanded={accountOpen}
						onclick={toggleAccount}
					>
						<svg
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<circle cx="12" cy="8" r="3.5"></circle>
							<path d="M5 20c.8-3.5 3.1-5.5 7-5.5s6.2 2 7 5.5"></path>
						</svg>
					</button>

					{#if accountOpen}
						<div class="account-menu">
							<div class="account-heading">
								<span class="account-label">SIGNED IN AS</span>
								<strong>{user.name}</strong>
								<span class="account-role">{user.role}</span>
							</div>

							<div class="account-divider"></div>

							<a
								href="/activity"
								onclick={closeMenus}
							>
								My activity
								<span>→</span>
							</a>

							<a
								href="/logout"
								onclick={closeMenus}
							>
								Log out
								<span>↗</span>
							</a>
						</div>
					{/if}
				</div>
			{:else}
				<a href="/login" class="nav-login">Log in</a>

				<a href="/signup" class="nav-signup">
					Sign up →
				</a>
			{/if}
		</div>

		<button
			class="mobile-toggle"
			type="button"
			aria-label="Toggle navigation"
			aria-expanded={mobileOpen}
			onclick={() => (mobileOpen = !mobileOpen)}
		>
			<span></span>
			<span></span>
		</button>
	</div>

	{#if mobileOpen}
		<div class="mobile-menu">
			<a href="/events" onclick={closeMenus}>Events</a>
			<a href="/projects" onclick={closeMenus}>Gallery</a>

			{#if user?.role === 'judge'}
				<a href="/judging" onclick={closeMenus}>Judging</a>
			{/if}

			{#if user?.role === 'organizer' || user?.role === 'admin'}
				<a href="/events/manage" onclick={closeMenus}>Manage</a>
			{/if}

			<div class="mobile-divider"></div>

			{#if user}
				<a href="/activity" onclick={closeMenus}>
					My activity →
				</a>

				<a href="/logout" onclick={closeMenus}>
					Log out ↗
				</a>
			{:else}
				<a href="/login" onclick={closeMenus}>
					Log in →
				</a>

				<a href="/signup" onclick={closeMenus}>
					Sign up →
				</a>
			{/if}
		</div>
	{/if}
</nav>

<style>
	.navbar {
		position: sticky;
		top: 0;
		z-index: 100;
		background: rgba(243, 240, 232, 0.94);
		border-bottom: 2px solid #111;
		backdrop-filter: blur(12px);
	}

	.nav-inner {
		min-height: 76px;
		padding: 0 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		max-width: 1500px;
		margin: 0 auto;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		color: #111;
		text-decoration: none;
		font-weight: 950;
		letter-spacing: -0.04em;
	}

	.brand-mark {
		width: 34px;
		height: 34px;
		display: grid;
		place-items: center;
		border: 2px solid #111;
		font-size: 0.9rem;
		line-height: 1;
		transition:
			background 180ms ease,
			color 180ms ease,
			transform 180ms ease;
	}

	.brand:hover .brand-mark {
		background: #111;
		color: #f3f0e8;
		transform: rotate(-8deg);
	}

	.brand-name {
		font-size: 1rem;
	}

	.desktop-nav {
		display: flex;
		align-items: center;
		gap: 2rem;
		margin-left: auto;
	}

	.desktop-nav a,
	.nav-login {
		color: #111;
		text-decoration: none;
		font-size: 0.72rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		position: relative;
	}

	.desktop-nav a::after,
	.nav-login::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -0.3rem;
		width: 100%;
		height: 2px;
		background: #111;
		transform: scaleX(0);
		transform-origin: right;
		transition: transform 180ms ease;
	}

	.desktop-nav a:hover::after,
	.nav-login:hover::after {
		transform: scaleX(1);
		transform-origin: left;
	}

	.desktop-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.nav-signup {
		display: inline-flex;
		align-items: center;
		padding: 0.7rem 0.9rem;
		background: #111;
		color: #f3f0e8;
		border: 2px solid #111;
		text-decoration: none;
		font-size: 0.72rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		transition:
			background 180ms ease,
			color 180ms ease,
			transform 180ms ease;
	}

	.nav-signup:hover {
		background: transparent;
		color: #111;
		transform: translateY(-2px);
	}

	.account {
		position: relative;
	}

	.account-button {
		width: 42px;
		height: 42px;
		padding: 0;
		border: 2px solid #111;
		background: transparent;
		color: #111;
		display: grid;
		place-items: center;
		cursor: pointer;
		transition:
			background 180ms ease,
			color 180ms ease,
			transform 180ms ease;
	}

	.account-button:hover,
	.account-button[aria-expanded='true'] {
		background: #111;
		color: #f3f0e8;
		transform: translateY(-2px);
	}

	.account-button svg {
		width: 21px;
		height: 21px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
	}

	.account-menu {
		position: absolute;
		right: 0;
		top: calc(100% + 0.75rem);
		width: 250px;
		background: #f3f0e8;
		color: #111;
		border: 2px solid #111;
		box-shadow: 8px 8px 0 #111;
		animation: menu-in 150ms ease both;
	}

	.account-heading {
		padding: 1rem;
		display: grid;
		gap: 0.25rem;
	}

	.account-label {
		font-size: 0.58rem;
		font-weight: 900;
		letter-spacing: 0.12em;
		opacity: 0.6;
	}

	.account-heading strong {
		font-size: 1rem;
	}

	.account-role {
		font-size: 0.65rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: 0.6;
	}

	.account-divider {
		height: 2px;
		background: #111;
	}

	.account-menu a {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.95rem 1rem;
		color: #111;
		text-decoration: none;
		font-size: 0.75rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		border-bottom: 1px solid #111;
		transition:
			background 150ms ease,
			color 150ms ease,
			padding 150ms ease;
	}

	.account-menu a:last-child {
		border-bottom: 0;
	}

	.account-menu a:hover {
		background: #111;
		color: #f3f0e8;
		padding-left: 1.25rem;
	}

	.mobile-toggle,
	.mobile-menu {
		display: none;
	}

	@keyframes menu-in {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 800px) {
		.nav-inner {
			padding: 0 1rem;
			min-height: 68px;
		}

		.desktop-nav,
		.desktop-actions {
			display: none;
		}

		.mobile-toggle {
			width: 42px;
			height: 42px;
			border: 2px solid #111;
			background: transparent;
			display: grid;
			align-content: center;
			gap: 5px;
			padding: 0 9px;
			cursor: pointer;
		}

		.mobile-toggle span {
			display: block;
			height: 2px;
			background: #111;
			width: 100%;
			transition: transform 180ms ease;
		}

		.mobile-menu {
			display: grid;
			background: #f3f0e8;
			border-top: 2px solid #111;
			padding: 0 1rem 1rem;
		}

		.mobile-menu a {
			color: #111;
			text-decoration: none;
			font-size: 1.1rem;
			font-weight: 900;
			padding: 1rem 0;
			border-bottom: 1px solid #111;
		}

		.mobile-divider {
			height: 1rem;
		}
	}
</style>