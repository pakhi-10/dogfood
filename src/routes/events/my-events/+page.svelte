<script lang="ts">
    import Navbar from '$lib/components/Navbar.svelte';

    let { data } = $props();

    const statusLabels: Record<string, string> = {
        draft: 'Draft',
        live: 'Live'
    };

    const formatDate = (date: string | Date | null) => {
        if (!date) return 'TBA';

        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date(date));
    };
</script>

<svelte:head>
    <title>My Events — DOGFOOD</title>
</svelte:head>

<div class="page">
    <Navbar user={data.user} />

    <main>
        <header class="page-header">
            <div>
                <p class="eyebrow">ORGANIZER</p>
                <h1>My events.</h1>
                <p>
                    Create, configure and manage the events you organize.
                </p>
            </div>

            <a href="/events/new" class="button primary">
                Create event →
            </a>
        </header>

        {#if data.events.length === 0}
            <section class="empty">
                <p class="empty-number">—</p>
                <h2>No events yet.</h2>
                <p>Create your first event to get started.</p>

                <a href="/events/new" class="button primary">
                    Create an event →
                </a>
            </section>
        {:else}
            <section class="events">
                {#each data.events as event, index}
                    <article class="event-card">
                        <a
                            href={`/events/${event.id}`}
                            class="event-main"
                        >
                            <div class="event-number">
                                {String(index + 1).padStart(2, '0')}
                            </div>

                            <div class="event-content">
                                <div class="event-title">
                                    <h2>{event.name}</h2>

                                    <span
                                        class={`status ${event.status}`}
                                    >
                                        {statusLabels[event.status] ??
                                            event.status}
                                    </span>
                                </div>

                                {#if event.tagline}
                                    <p class="tagline">
                                        {event.tagline}
                                    </p>
                                {:else if event.about}
                                    <p class="tagline">
                                        {event.about}
                                    </p>
                                {/if}

                                <div class="meta">
                                    <span>
                                        APPLICATION DEADLINE
                                    </span>

                                    <strong>
                                        {formatDate(
                                            event.applicationCloseAt
                                        )}
                                    </strong>
                                </div>
                            </div>

                            <div class="open-arrow">↗</div>
                        </a>

                        <div class="event-actions">
                            <a
                                href={`/events/${event.id}`}
                                class="action-button"
                            >
                                Edit
                            </a>

                            <form
                                method="POST"
                                action="?/deleteEvent"
                                onsubmit={(event) => {
                                    if (
                                        !confirm(
                                            `Delete "${data.events[index].name}"? This will permanently delete the event and its submissions.`
                                        )
                                    ) {
                                        event.preventDefault();
                                    }
                                }}
                            >
                                <input
                                    type="hidden"
                                    name="eventId"
                                    value={event.id}
                                />

                                <button
                                    type="submit"
                                    class="action-button danger"
                                >
                                    Delete
                                </button>
                            </form>
                        </div>
                    </article>
                {/each}
            </section>
        {/if}
    </main>
</div>

<style>
    .page {
        min-height: 100vh;
        background: #f5f4ef;
        color: #111;
    }

    main {
        width: min(1200px, calc(100% - 48px));
        margin: 0 auto;
        padding: 72px 0;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 32px;
        margin-bottom: 56px;
    }

    .eyebrow {
        margin: 0 0 12px;
        font-size: 12px;
        letter-spacing: 0.12em;
        font-weight: 700;
    }

    h1 {
        margin: 0;
        font-size: clamp(48px, 7vw, 88px);
        line-height: 0.9;
        letter-spacing: -0.06em;
    }

    .page-header p:last-child {
        max-width: 520px;
        margin: 24px 0 0;
        color: #666;
        line-height: 1.6;
    }

    .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 46px;
        padding: 0 20px;
        border: 1px solid #111;
        color: #111;
        text-decoration: none;
        font-size: 13px;
        font-weight: 700;
        background: transparent;
    }

    .button.primary {
        background: #111;
        color: white;
    }

    .events {
        border-top: 1px solid #111;
    }

    .event-card {
        display: grid;
        grid-template-columns: 1fr auto;
        border-bottom: 1px solid #bbb;
    }

    .event-main {
        display: grid;
        grid-template-columns: 70px 1fr auto;
        gap: 24px;
        padding: 28px 0;
        color: inherit;
        text-decoration: none;
    }

    .event-number {
        font-size: 13px;
        color: #777;
    }

    .event-title {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .event-title h2 {
        margin: 0;
        font-size: 28px;
        letter-spacing: -0.03em;
    }

    .status {
        padding: 5px 9px;
        border: 1px solid #aaa;
        font-size: 10px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .status.live {
        border-color: #111;
    }

    .tagline {
        margin: 10px 0 0;
        color: #666;
        line-height: 1.5;
    }

    .meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 5px;
        min-width: 140px;
    }

    .meta span {
        font-size: 9px;
        letter-spacing: 0.08em;
        color: #777;
    }

    .meta strong {
        font-size: 13px;
    }

    .open-arrow {
        padding: 28px 24px;
        font-size: 24px;
    }

    .event-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 20px 0;
        border-top: 1px solid #ddd;
    }

    .action-button {
        min-height: 38px;
        padding: 0 15px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #aaa;
        background: transparent;
        color: #111;
        text-decoration: none;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
    }

    .action-button.danger {
        border-color: #b00020;
        color: #b00020;
    }

    .empty {
        border-top: 1px solid #111;
        padding: 72px 0;
    }

    .empty-number {
        font-size: 40px;
        margin: 0;
    }

    .empty h2 {
        margin: 20px 0 8px;
        font-size: 32px;
    }

    .empty p:not(.empty-number) {
        color: #666;
        margin-bottom: 28px;
    }

    @media (max-width: 800px) {
        main {
            width: min(100% - 28px, 1200px);
            padding: 40px 0;
        }

        .page-header {
            display: block;
        }

        .page-header .button {
            margin-top: 28px;
        }

        .event-card {
            display: block;
        }

        .event-main {
            grid-template-columns: 40px 1fr;
        }

        .meta {
            display: none;
        }

        .open-arrow {
            display: none;
        }
    }
</style>