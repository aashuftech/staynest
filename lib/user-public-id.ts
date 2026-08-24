import { Counter } from '@/lib/models/Counter'
import { User } from '@/lib/models/User'

/** Returns a unique, increasing identifier for non-admin StayNest accounts. */
export async function nextUserPublicId() {
  // Keep the counter ahead of imported/legacy records as well as new signups.
  const highestExisting = await User.findOne({ role: 'USER', publicId: { $type: 'number' } })
    .sort({ publicId: -1 })
    .select('publicId')
    .lean()

  await Counter.findOneAndUpdate(
    { key: 'user-public-id' },
    { $max: { value: Number(highestExisting?.publicId || 0) } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  const counter: any = await Counter.findOneAndUpdate(
    { key: 'user-public-id' },
    { $inc: { value: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean()

  return Number(counter.value)
}
