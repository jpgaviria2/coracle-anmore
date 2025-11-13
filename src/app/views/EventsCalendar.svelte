<script lang="ts">
  import {onMount} from "svelte"
  import {EVENT_DATE, EVENT_TIME} from "@welshman/util"
  import {makeScopeFeed, Scope} from "@welshman/feeds"
  import {repository} from "@welshman/app"
  import {getTagValue} from "@welshman/util"
  import {secondsToDate, LOCALE} from "@welshman/lib"
  import {Router, addMaximalFallbacks} from "@welshman/router"
  import Content from "src/partials/Content.svelte"
  import FlexColumn from "src/partials/FlexColumn.svelte"
  import Heading from "src/partials/Heading.svelte"
  import Button from "src/partials/Button.svelte"
  import Card from "src/partials/Card.svelte"
  import EventInfo from "src/app/shared/EventInfo.svelte"
  import {makeFeed} from "src/domain"
  import {myLoad} from "src/engine"

  const eventsFeed = makeFeed({
    definition: makeScopeFeed({
      scope: Scope.Kind,
      kinds: [EVENT_DATE, EVENT_TIME],
    }),
  })

  let currentDate = new Date()
  let eventsByDate = new Map<string, any[]>()
  let loading = true

  const getMonthYear = (date: Date) => {
    return date.toLocaleDateString(LOCALE, {month: "long", year: "numeric"})
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  }

  const getEventDate = (event: any) => {
    const startTag = getTagValue("start", event.tags)
    if (startTag) {
      const start = parseInt(startTag)
      if (start && start > 0) {
        return secondsToDate(start)
      }
    }
    return null
  }

  const groupEventsByDate = (events: any[]) => {
    const grouped = new Map<string, any[]>()
    for (const event of events) {
      const eventDate = getEventDate(event)
      if (eventDate) {
        const key = formatDateKey(eventDate)
        if (!grouped.has(key)) {
          grouped.set(key, [])
        }
        grouped.get(key)!.push(event)
      }
    }
    return grouped
  }

  const loadEvents = async () => {
    loading = true
    try {
      const relays = Router.get()
        .FromUser()
        .policy(addMaximalFallbacks)
        .getUrls()
      
      await myLoad({
        relays,
        filters: [{kinds: [EVENT_DATE, EVENT_TIME]}],
      })

      const allEvents = repository.query([{kinds: [EVENT_DATE, EVENT_TIME]}])
      eventsByDate = groupEventsByDate(allEvents)
    } catch (e) {
      console.error("Failed to load events:", e)
    } finally {
      loading = false
    }
  }

  const prevMonth = () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    loadEvents()
  }

  const nextMonth = () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    loadEvents()
  }

  const goToToday = () => {
    currentDate = new Date()
    loadEvents()
  }

  const getEventsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const key = formatDateKey(date)
    return eventsByDate.get(key) || []
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isPastDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    return date < today
  }

  onMount(() => {
    loadEvents()
  })

  $: daysInMonth = getDaysInMonth(currentDate)
  $: firstDay = getFirstDayOfMonth(currentDate)
  $: monthYear = getMonthYear(currentDate)
  $: today = new Date()
</script>

<Content size="lg">
  <FlexColumn class="gap-6">
    <div class="flex items-center justify-between">
      <Heading>Events Calendar</Heading>
      <div class="flex gap-2">
        <Button class="btn" on:click={prevMonth}>
          <i class="fa fa-chevron-left" />
        </Button>
        <Button class="btn" on:click={goToToday}>Today</Button>
        <Button class="btn" on:click={nextMonth}>
          <i class="fa fa-chevron-right" />
        </Button>
      </div>
    </div>

    <div class="text-center text-xl font-bold">{monthYear}</div>

    {#if loading}
      <div class="text-center text-neutral-400">Loading events...</div>
    {:else}
      <div class="grid grid-cols-7 gap-1">
        <!-- Day headers -->
        {#each ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as day}
          <div class="p-2 text-center text-sm font-bold text-neutral-400">{day}</div>
        {/each}

        <!-- Empty cells for days before month starts -->
        {#each Array(firstDay) as _}
          <div class="aspect-square"></div>
        {/each}

        <!-- Calendar days -->
        {#each Array(daysInMonth) as _, i}
          {@const day = i + 1}
          {@const events = getEventsForDay(day)}
          {@const hasEvents = events.length > 0}
          {@const isTodayDate = isToday(day)}
          {@const isPast = isPastDate(day)}
          <div
            class="aspect-square border border-solid border-neutral-600 p-1"
            style={isTodayDate ? "background-color: rgba(var(--accent-rgb), 0.2)" : ""}
            class:opacity-50={isPast}>
            <div class="flex h-full flex-col">
              <div
                class="text-sm"
                class:font-bold={isTodayDate}
                class:text-accent={isTodayDate}
                class:text-neutral-400={isPast}>
                {day}
              </div>
              {#if hasEvents}
                <div class="mt-1 flex flex-wrap gap-0.5">
                  {#each events.slice(0, 3) as event}
                    <div
                      class="h-1 w-1 rounded-full bg-accent"
                      title={getTagValue("title", event.tags) || getTagValue("name", event.tags)} />
                  {/each}
                  {#if events.length > 3}
                    <div class="text-xs text-neutral-400">+{events.length - 3}</div>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <!-- Events for selected month -->
      <div class="mt-6">
        <h3 class="mb-4 text-lg font-bold">Events This Month</h3>
        {#if eventsByDate.size === 0}
          <p class="text-neutral-400">No events scheduled for this month.</p>
        {:else}
          <FlexColumn class="gap-4">
            {#each Array.from(eventsByDate.entries())
              .sort(([a], [b]) => a.localeCompare(b))
              .filter(([key]) => {
                const [year, month] = key.split("-").map(Number)
                return (
                  year === currentDate.getFullYear() && month === currentDate.getMonth() + 1
                )
              }) as [string, any[]]}
              {@const [dateKey, events] = item}
              {@const [year, month, day] = dateKey.split("-").map(Number)}
              {@const date = new Date(year, month - 1, day)}
              <div>
                <h4 class="mb-2 text-sm font-bold text-neutral-300">
                  {date.toLocaleDateString(LOCALE, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h4>
                <FlexColumn class="gap-2">
                  {#each events as event}
                    <Card>
                      <EventInfo {event} />
                    </Card>
                  {/each}
                </FlexColumn>
              </div>
            {/each}
          </FlexColumn>
        {/if}
      </div>
    {/if}
  </FlexColumn>
</Content>

