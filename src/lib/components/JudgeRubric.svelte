<script lang="ts">
	import type { JudgeCriterion } from '$lib/server/judge/types';

	let {
		criteria,
		scores,
		onScore
	}: {
		criteria: JudgeCriterion[];
		scores: Record<string, number | null>;
		onScore: (criterionId: string, value: number | null) => void;
	} = $props();
</script>

<section class="rubric">
	<div class="section-heading">
		<h2>Judging rubric</h2>
	</div>

	{#if criteria.length === 0}
		<div class="not-configured">
			<p>
				The organizer has not configured the judging rubric yet.
			</p>
		</div>
	{:else}
		<div class="criteria">
			{#each criteria as criterion}
				<div class="criterion">
					<div class="criterion-info">
						<div class="criterion-name">
							{criterion.name}
						</div>

						<div class="criterion-weight">
							Weight: {criterion.weight}
						</div>
					</div>

					<div class="score-input">
						<input
							type="number"
							min="0"
							max={criterion.maxScore ?? undefined}
							value={scores[criterion.id] ?? ''}
							placeholder="—"
							oninput={(event) => {
								const value = (event.currentTarget as HTMLInputElement).value;

								onScore(
									criterion.id,
									value === '' ? null : Number(value)
								);
							}}
						/>

						<span>
							/
							{criterion.maxScore ?? '—'}
						</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	.rubric {
		margin-top: 32px;
	}

	.section-heading {
		margin-bottom: 14px;
	}

	.section-heading h2 {
		margin: 0;
		font-size: 22px;
		font-weight: 900;
	}

	.criteria {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.criterion {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		padding: 16px;
		border: 2px solid #111;
		background: #fff;
	}

	.criterion-name {
		font-weight: 900;
	}

	.criterion-weight {
		margin-top: 4px;
		font-size: 12px;
		font-weight: 700;
	}

	.score-input {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 18px;
		font-weight: 900;
	}

	input {
		width: 70px;
		padding: 8px;
		border: 2px solid #111;
		border-radius: 5px;
		font: inherit;
		text-align: center;
	}

	.not-configured {
		padding: 20px;
		border: 2px dashed #111;
		background: #f5f2ea;
		font-weight: 700;
	}
</style>