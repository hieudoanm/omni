'use client';

import { type FC } from 'react';
import { FiPlus, FiTrash2, FiZap } from 'react-icons/fi';
import type { ObjectAnimation } from '@/types/keynotes/deck';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { NumberInput, SelectInput, Toggle } from '@/components/office/keynotes/atoms/FormControls';
import {
  ANIMATION_EFFECTS,
  EASINGS,
  MOTION_PATH_PRESETS,
  defaultAnimation,
} from '@/lib/office/keynotes/animations';
import { AnimationOrderList } from '@/components/office/keynotes/organisms/panels/animations/AnimationOrderList';
import { AnimationPreview } from '@/components/office/keynotes/organisms/panels/animations/AnimationPreview';

export const AnimationsPanel: FC = () => {
  const { activeSlide, selectedObjectIds, setObjectAnimation, updateObject } = useDeck();
  const selected = activeSlide?.objects.filter((o) => selectedObjectIds.includes(o.id));
  const first = selected?.[0];
  const anim = first?.animation;
  const mp = anim?.motionPath;

  const apply = (patch: Partial<ObjectAnimation>) => {
    if (!first) return;
    setObjectAnimation(first.id, {
      ...(anim ?? defaultAnimation('entrance')),
      ...patch,
    });
  };

  const moveOrder = (id: string, dir: 1 | -1) => {
    const animated =
      activeSlide?.objects.filter((o) => o.animation).sort((a, b) => a.z - b.z) ?? [];
    const i = animated.findIndex((o) => o.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= animated.length) return;
    updateObject(animated[i].id, { z: animated[j].z });
    updateObject(animated[j].id, { z: animated[i].z });
  };

  return (
    <div className='flex flex-col gap-3 p-3'>
      <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>Animations</div>

      {!first ? (
        <p className='text-xs opacity-50'>Select an object to animate it</p>
      ) : (
        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-2'>
            <FiZap className='text-primary size-4' />
            <span className='text-sm'>{first.name}</span>
          </div>
          {anim ? (
            <>
              <AnimationPreview anim={anim} />
              <div className='flex flex-col gap-2'>
                <div className='grid grid-cols-2 gap-2'>
                  <SelectInput
                    label='Type'
                    value={anim.type}
                    options={[
                      { value: 'entrance', label: 'Entrance' },
                      { value: 'emphasis', label: 'Emphasis' },
                      { value: 'exit', label: 'Exit' },
                    ]}
                    onChange={(v) =>
                      setObjectAnimation(first.id, {
                        ...defaultAnimation(v as ObjectAnimation['type']),
                        duration: anim.duration,
                        delay: anim.delay,
                      })
                    }
                  />
                  <SelectInput
                    label='Effect'
                    value={anim.effect}
                    options={ANIMATION_EFFECTS[anim.type].map((e) => ({
                      value: e,
                      label: e,
                    }))}
                    onChange={(v) => apply({ effect: v as ObjectAnimation['effect'] })}
                  />
                  <SelectInput
                    label='Trigger'
                    value={anim.trigger}
                    options={[
                      { value: 'click', label: 'On click' },
                      { value: 'with', label: 'With previous' },
                      { value: 'after', label: 'After previous' },
                      { value: 'hover', label: 'On hover' },
                    ]}
                    onChange={(v) => apply({ trigger: v as ObjectAnimation['trigger'] })}
                  />
                  <SelectInput
                    label='Easing'
                    value={anim.easing}
                    options={EASINGS.map((e) => ({
                      value: e.id,
                      label: e.label,
                    }))}
                    onChange={(v) => apply({ easing: v as ObjectAnimation['easing'] })}
                  />
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <NumberInput
                    label='Duration'
                    value={anim.duration}
                    min={100}
                    max={5000}
                    step={100}
                    onChange={(v) => apply({ duration: v })}
                  />
                  <NumberInput
                    label='Delay'
                    value={anim.delay}
                    min={0}
                    max={5000}
                    step={100}
                    onChange={(v) => apply({ delay: v })}
                  />
                  <NumberInput
                    label='Stagger'
                    value={anim.stagger ?? 0}
                    min={0}
                    max={5000}
                    step={50}
                    onChange={(v) => apply({ stagger: v })}
                  />
                  <Toggle
                    label='Repeat'
                    checked={(anim.repeat ?? 1) > 1}
                    onChange={(v) => apply({ repeat: v ? 2 : 1 })}
                  />
                </div>
                <Toggle
                  label='Reverse'
                  checked={anim.reverse ?? false}
                  onChange={(v) => apply({ reverse: v })}
                />
                <SelectInput
                  label='Motion path'
                  value={mp?.type ?? 'none'}
                  options={[
                    { value: 'none', label: 'None' },
                    ...MOTION_PATH_PRESETS.map((p) => ({
                      value: p.id,
                      label: p.label,
                    })),
                    { value: 'custom', label: 'Custom path' },
                  ]}
                  onChange={(v) =>
                    apply({
                      motionPath:
                        v === 'custom'
                          ? {
                              type: 'custom',
                              path: mp?.type === 'custom' ? mp.path : 'M 0 0 Q 100 100 200 0',
                            }
                          : { type: v as 'none' | 'arc' | 'loop' | 'star' },
                    })
                  }
                />
                {mp?.type === 'custom' && (
                  <input
                    type='text'
                    value={mp.path}
                    onChange={(e) =>
                      apply({
                        motionPath: { type: 'custom', path: e.target.value },
                      })
                    }
                    className='input input-xs input-bordered w-full font-mono'
                    placeholder='SVG path e.g. M 0 0 Q 100 100 200 0'
                  />
                )}
              </div>
              <button
                type='button'
                onClick={() => setObjectAnimation(first.id, null)}
                className='btn btn-ghost btn-xs text-error gap-1'>
                <FiTrash2 /> Remove animation
              </button>
            </>
          ) : (
            <button
              type='button'
              onClick={() => setObjectAnimation(first.id, defaultAnimation('entrance'))}
              className='btn btn-outline btn-sm gap-1'>
              <FiPlus /> Add entrance animation
            </button>
          )}

          <div className='divider' />

          <AnimationOrderList objects={activeSlide?.objects ?? []} onMove={moveOrder} />
        </div>
      )}
    </div>
  );
};
