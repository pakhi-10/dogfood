<script lang="ts">
	let {
		startAt,
		endAt
	}: {
		startAt: string | Date | null;
		endAt: string | Date | null;
	} = $props();

	let now = $state(Date.now());

	const timer = $derived.by(() => {
		if (!startAt || !endAt) {
			return {
				status: 'unavailable',
				label: 'Timer unavailable',
				seconds: 0
			};
		}

		const start = new Date(startAt).getTime();
		const end = new Date(endAt).getTime();
		const current = now;

		if (current < start) {
			return {
				status: 'upcoming',
				label: 'Judging starts soon',
				seconds: Math.max(0, Math.ceil((start - current) / 1000))
			};
		}

		if (current >= end) {
			return {
				status: 'ended',
				label: 'Judging ended',
				seconds: 0
			};
		}

		return {
			status: 'active',
			label: 'Time remaining',
			seconds: Math.max(0, Math.ceil((end - current) / 1000))
		};
	});

	const formattedTime = $derived.by(() => {
		const totalSeconds = timer.seconds;
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	});

	$effect(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<div class="timer">
	<span class="label">{timer.label}</span>
	<strong>{formattedTime}</strong>
</div>

<style>
	.timer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 12px 16px;
		border: 2px solid #111;
		background: #fff;
	}

	.label {
		font-size: 14px;
		font-weight: 700;
	}

	strong {
		font-family: monospace;
		font-size: 20px;
	}
</style>