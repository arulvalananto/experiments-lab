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
