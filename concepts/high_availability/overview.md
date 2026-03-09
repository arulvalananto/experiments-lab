# Overview of High Availability

The higher the availability, the less impact each individual failure has. To manage HA, engineers use SLAs, SLOs, and SLIs. These turn vague ideas like “keep it up and running” into numbers we can measure:

## Service Level Agreement (SLA): Contract with customers about service performance

This contract keeps a record of what the service provider promises to deliver. There are penalties or costs if the contract is not respected. In HA, this is an agreement about how much downtime is acceptable. For example, “our app will be online 99.9% of the time. If not, we’ll give your money back.”

## Service Level Objective (SLO): Specific internal goal for the service performance

This is the target that internal teams are trying to hit with a desired metric. Your SLA is the minimum you promise customers; your SLO is the better performance you target internally. For example, if the SLA is 95% uptime, the SLO might be 98% to leave a 3% safety margin

## Service Level Indicator (SLI): Metric used to measure service performance

Without measuring service performance, we can’t know if we’re hitting the targets. These metrics should reflect the SLO and SLA

For example, “Percentage of failed requests.”

SLA vs SLO vs SLI

## Example: Restaurant Delivery

Let’s illustrate it with an example:

- A restaurant promises customers that their food will be delivered within 20 minutes of ordering (SLA).
- The kitchen aims to finish orders in 15 minutes to stay ahead (SLO).
- They track the average order completion time (SLI).

These targets get expressed in “nines of availability”.

## Recovery Time Objective (RTO)

How fast should the system recover from failure? How long can it be down for? Larger RTO means more downtime is acceptable; smaller RTO means less downtime. For example, an RTO of 10 minutes means that the system should be able to recover within 10 minutes of failing

## Recovery Point Objective (RPO)

To what point in time does the system recover? How much data loss is acceptable? Larger RPO means more data loss, smaller RPO means less. For example, an RPO of 5 minutes means 5 minutes of data gets lost.

## MTTD (Mean Time to Detect)

This is the mean time needed to notice a failure. How long does it usually take for the system or team to detect that something is wrong? Smaller MTTD means faster detection; larger MTTD means slower detection. For example, an MTTD of 30 seconds means issues get found half a minute after they occur on average

## MTTR (Mean Time to Repair)

This is the mean time needed to fix a failure. How long does the system usually take to recover? Larger MTTR means more time to recover, smaller MTTR means less. For example, an MTTR of 5 minutes means the failure will take 5 minutes to recover on average

## MTBF (Mean Time Between Failures)

This is the mean time between two failures. How often does the system usually fail? Larger MTBF means failures happen less often & vice-versa. For example, an MTBF of 1h means failures usually happen every hour

## MTTF (Mean Time to Failure)

This metric is designed for non-recoverable components. How long is the lifespan of this component? This metric differs from MTBF because it lacks a recovery component. The component is alive, and then it crashes without recovery. MTTF is the time between those two points.

A larger MTTF means a component has a longer lifespan, and a smaller MTTF means a shorter one. For example, an MTTF of 3 years means a component usually lasts for 3 years before becoming unusable.

## Formula for Availability

Availability links uptime & downtime in one line:

```text
Availability = MTBF / (MTBF + MTTR)
```

If the system runs for 1000 hours before a 1-hour fix, uptime is 99.9%. Every extra nine costs more to achieve. Past “three nines,” you buy less outage and pay more in redundancy, automation, and testing.
