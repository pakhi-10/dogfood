<script lang="ts">
	let mobileOpen = false;
</script>

<header class="navbar">
	<div class="navbar-inner">
		<a href="/" class="logo">DOGFOOD</a>

		<nav class:open={mobileOpen}>
			<a href="/events">Events</a>
			<a href="/projects">Gallery</a>
		</nav>

		<div class="actions">
			<a href="/login" class="login">Log in</a>
			<a href="/signup" class="signup">Sign up</a>
		</div>

		<button
			class="menu-button"
			aria-label="Toggle navigation"
			onclick={() => (mobileOpen = !mobileOpen)}
		>
			<span></span>
			<span></span>
			<span></span>
		</button>
	</div>
</header>

<style>
	.navbar {
		position: sticky;
		top: 0;
		z-index: 100;
		border-bottom: 1px solid #deded8;
		background: rgba(248, 248, 245, 0.92);
		backdrop-filter: blur(12px);
	}

	.navbar-inner {
		width: min(1200px, calc(100% - 40px));
		height: 72px;
		margin: auto;

		display: flex;
		align-items: center;
		gap: 40px;
	}

	.logo {
		font-size: 1.15rem;
		font-weight: 900;
		letter-spacing: -0.06em;
	}

	nav {
		display: flex;
		gap: 28px;
		margin-left: 20px;
	}

	nav a,
	.login {
		color: #666;
		font-size: 0.9rem;
		font-weight: 600;
	}

	nav a:hover,
	.login:hover {
		color: #111;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 20px;
		margin-left: auto;
	}

	.signup {
		padding: 9px 15px;
		border: 1px solid #111;
		background: #111;
		color: white;
		font-size: 0.85rem;
		font-weight: 700;
	}

	.menu-button {
		display: none;
		margin-left: auto;
		padding: 5px;
		border: 0;
		background: none;
		cursor: pointer;
	}

	.menu-button span {
		display: block;
		width: 22px;
		height: 2px;
		margin: 4px 0;
		background: #111;
	}

	@media (max-width: 700px) {
		.navbar-inner {
			width: calc(100% - 28px);
		}

		nav {
			display: none;
			position: absolute;
			top: 72px;
			left: 0;
			right: 0;

			flex-direction: column;
			gap: 0;

			margin: 0;
			padding: 10px 20px 20px;

			border-bottom: 1px solid #deded8;
			background: #f8f8f5;
		}

		nav.open {
			display: flex;
		}

		nav a {
			padding: 14px 0;
		}

		.actions {
			display: none;
		}

		.menu-button {
			display: block;
		}
	}
</style>