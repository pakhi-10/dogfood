<script lang="ts">
	let {
		scored,
		total
	}: {
		scored: number;
		total: number;
	} = $props();

	let percentage = $derived(
		total === 0 ? 0 : Math.round((scored / total) * 100)
	);
</script>

<div class="progress-wrapper">
	<div class="progress-header">
		<span>Judging progress</span>
		<strong>{scored} / {total} teams scored</strong>
	</div>

	<div class="bar">
		<div
			class="fill"
			style={`width: ${percentage}%`}
		></div>
	</div>
</div>

<style>
	.progress-wrapper {
		margin: 24px 0;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		gap: 20px;
		font-size: 14px;
		font-weight: 800;
		margin-bottom: 8px;
	}

	.bar {
		height: 12px;
		border: 2px solid #111;
		background: #fff;
		overflow: hidden;
	}

	.fill {
		height: 100%;
		background: #111;
		transition: width 0.3s ease;
	}
</style>