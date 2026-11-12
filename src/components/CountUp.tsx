import { useEffect } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'

type Props = { value: number; format: (n: number) => string }

export function CountUp({ value, format }: Props) {
  const current = useMotionValue(0)
  const text = useTransform(current, format)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) {
      current.set(value)
      return
    }
    const controls = animate(current, value, { duration: 1.6, ease: [0.2, 0.8, 0.2, 1] })
    return () => controls.stop()
  }, [value, reduce, current])

  return <motion.span>{text}</motion.span>
}
