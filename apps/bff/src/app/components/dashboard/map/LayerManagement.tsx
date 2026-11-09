'use client';
import {
  AreaFeature,
  type Level,
  useWorkspaceActions,
  useWorkspaceState,
} from '@/app/features/map-editor';

import React, { startTransition, useCallback, useEffect, useMemo } from 'react';
import { useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiUnlock } from 'react-icons/fi';
import { HiOutlineCheck } from 'react-icons/hi';

export default function LayerManagement() {
  const { features, selectedFeatureId, visibleFeatureIds, editableFeatureIds } =
    useWorkspaceState();
  const actions = useWorkspaceActions();

  const [visibleLevels, setVisibleLevels] = useState<{
    [key in Level]: boolean;
  }>({ region: true, block: true, parcel: true });

  const { regions, blocks, parcels } = useMemo(
    () =>
      features.features.reduce(
        (a, c) => {
          switch (c.properties.level) {
            case 'region':
              a.regions.push(c);
              break;
            case 'block':
              a.blocks.push(c);
              break;
            case 'parcel':
              a.parcels.push(c);
              break;
          }
          return a;
        },
        {
          regions: [] as AreaFeature[],
          blocks: [] as AreaFeature[],
          parcels: [] as AreaFeature[],
        },
      ),
    [features],
  );

  const handleModeChange: LayerProps['onModeChange'] = useCallback(
    ({ layer, mode }) => {
      if (mode === 'edit' && !editableFeatureIds.has(layer.id)) {
        actions.setEditableFeatureIds(
          new Set([...editableFeatureIds, layer.id]),
        );
      } else if (mode === 'view' && editableFeatureIds.has(layer.id)) {
        actions.setEditableFeatureIds(
          new Set(editableFeatureIds.values().filter((id) => id !== layer.id)),
        );
      }
    },
    [actions, editableFeatureIds],
  );

  const handleSelectionChange: LayerProps['onSelect'] = useCallback(
    ({ layer, selected }) => {
      if (selected && layer.id !== selectedFeatureId) {
        actions.selectFeature(layer.id);
      }

      if (!selected && layer.id === selectedFeatureId) {
        actions.clearSelection();
      }
    },
    [actions, selectedFeatureId],
  );

  const collectVisibleFeatures = useCallback(
    (vis: typeof visibleLevels) => {
      return new Set(
        features.features
          .filter((f) => vis[f.properties.level])
          .map((f) => f.id),
      ) as ReadonlySet<string>;
    },
    [features],
  );

  const visibleLevelsDispatch = useCallback(
    (patch: Partial<{ [key in Level]: boolean }>) => {
      return (state: { [key in Level]: boolean }) => {
        const newState = { ...state, ...patch };
        actions.setVisibleFeatureIds(collectVisibleFeatures(newState));
        return newState;
      };
    },
    [actions],
  );

  console.log(visibleLevels);

  return (
    <aside className="py-3 pl-2 pr-3">
      <h3 className="border-b border-border text-xs pb-2 block">
        مدیریت لایه ها
      </h3>
      <div className="select-none">
        <Layer
          colors={{ icon: '--map-green', input: '--map-green-hover' }}
          data={regions}
          label="مناطق"
          onModeChange={handleModeChange}
          onSelect={handleSelectionChange}
          setLayerVisibility={(visible) =>
            startTransition(() =>
              setVisibleLevels(visibleLevelsDispatch({ region: visible })),
            )
          }
          visible={visibleLevels.region}
          editableFeatureIds={editableFeatureIds}
          selectedFeatureId={selectedFeatureId}
        />
        <Layer
          colors={{ icon: '--map-blue', input: '--map-blue-hover' }}
          data={blocks}
          label="بلوک‌ها"
          onModeChange={handleModeChange}
          onSelect={handleSelectionChange}
          setLayerVisibility={(visible) =>
            startTransition(() =>
              setVisibleLevels(visibleLevelsDispatch({ block: visible })),
            )
          }
          visible={visibleLevels.block}
          editableFeatureIds={editableFeatureIds}
          selectedFeatureId={selectedFeatureId}
        />
        <Layer
          colors={{ icon: '--map-yellow', input: '--map-yellow-hover' }}
          data={parcels}
          label="قطعه‌ها"
          onModeChange={handleModeChange}
          onSelect={handleSelectionChange}
          setLayerVisibility={(visible) =>
            startTransition(() =>
              setVisibleLevels(visibleLevelsDispatch({ parcel: visible })),
            )
          }
          visible={visibleLevels.parcel}
          editableFeatureIds={editableFeatureIds}
          selectedFeatureId={selectedFeatureId}
        />
        {/* <Layer
          colors={{ icon: '--map-purple', input: '--map-purple-hover' }}
          data={[]}
          label="مالکین"
          editableFeatureIds={editableFeatureIds}
          selectedFeatureId={selectedFeatureId}
        /> */}
      </div>
    </aside>
  );
}

interface LayerProps {
  visible: boolean;
  setLayerVisibility?: (visible: boolean) => void;
  selectedFeatureId: string | null;
  editableFeatureIds: ReadonlySet<string>;
  onModeChange?(event: { layer: AreaFeature; mode: 'edit' | 'view' }): void;
  onSelect?(event: { layer: AreaFeature; selected: boolean }): void;
  colors: { icon: string; input: string };
  label: string;
  data: AreaFeature[];
}

function Layer(props: LayerProps) {
  return (
    <div
      className={`feature_items_wrap relative h-fit ${!props.visible ? 'overflow-visible' : 'overflow-hidden'} border-b border-border cursor-pointer`}
    >
      <div
        className="title_feature flex items-center justify-end py-3 gap-2 relative"
        onClick={() => {
          props.setLayerVisibility?.(!props.visible);
        }}
      >
        {!props.visible ? (
          <FiEyeOff
            className="absolute right-1.5"
            stroke={`var(${props.colors.icon})`}
          />
        ) : (
          <FiEye
            className="absolute right-1.5"
            stroke={`var(${props.colors.icon})`}
          />
        )}
        <h4 className="text-xs font-medium">{props.label}</h4>
        <PolygonIcon fillColor={`var(${props.colors.icon})`} />
      </div>
      <div
        className={`${!props.visible ? 'absolute opacity-0 invisible' : 'opacity-100 visible'} w-full flex flex-col gap-3 mb-3 pr-1`}
      >
        <form>
          {props.data.map((item, key) => (
            <div key={key} className="flex items-center">
              <label className="relative min-w-fit shrink-0 rounded-full transition-colors hover:bg-background-hover p-2">
                <input
                  name="mode"
                  type="checkbox"
                  className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    props.onModeChange?.({
                      layer: item,
                      mode: e.target.checked ? 'edit' : 'view',
                    });
                  }}
                  checked={props.editableFeatureIds.has(item.id)}
                />
                <FiUnlock className="peer-not-checked:hidden text-border-strong" />
                <FiLock className="peer-checked:hidden text-border-strong" />
              </label>
              <label className="w-full flex items-center justify-end cursor-pointer gap-3 text-xs select-none">
                <span>{item.properties.name}</span>
                <div className="relative">
                  <input
                    type="radio"
                    name="selected"
                    onChange={() => {}}
                    onClick={(e) =>
                      props.onSelect?.({
                        layer: item,
                        selected:
                          props.selectedFeatureId === item.id ? false : true,
                      })
                    }
                    checked={props.selectedFeatureId === item.id}
                    style={
                      {
                        '--input': `var(${props.colors.input})`,
                      } as React.CSSProperties
                    }
                    className={`peer appearance-none w-4 h-4 border border-border checked:border-0 rounded-sm cursor-pointer transition-colors duration-200  checked:bg-(--input)`}
                  />
                  <HiOutlineCheck className="peer-checked:block hidden absolute inset-x-0.5 inset-y-0.5 text-background" />
                </div>
              </label>
            </div>
          ))}
        </form>
      </div>
    </div>
  );
}

export const PolygonIcon = ({
  fillColor = '',
  className = '',
  width = '20px',
}: {
  fillColor?: string;
  className?: string;
  width?: string;
}) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
    preserveAspectRatio="xMidYMid meet"
    fill={fillColor}
    width={width}
    className={className}
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M32.5 10.95c-6.89 0-12.55 5.66-12.55 12.55c0 4.02 1.935 7.613 4.91 9.916L14.815 54.172a12.354 12.354 0 0 0-2.316-.223C5.61 53.95-.05 59.61-.05 66.5c0 6.89 5.66 12.55 12.55 12.55c5.13 0 9.54-3.151 11.463-7.603l51.277 7.71c1.232 5.629 6.281 9.894 12.26 9.894c6.656 0 12.114-5.297 12.48-11.867a3.5 3.5 0 0 0 .07-.684a3.5 3.5 0 0 0-.071-.7c-.375-6.562-5.829-11.85-12.479-11.85c-.134 0-.264.015-.396.019L80.242 43.05c3.275-2.127 5.509-5.746 5.738-9.867a3.5 3.5 0 0 0 .07-.684a3.5 3.5 0 0 0-.071-.7c-.375-6.562-5.829-11.85-12.479-11.85c-5.062 0-9.452 3.06-11.43 7.415l-17.082-4.517a3.5 3.5 0 0 0-.01-.047c-.374-6.563-5.828-11.852-12.478-11.852zm0 7c3.107 0 5.55 2.443 5.55 5.55c0 3.107-2.443 5.55-5.55 5.55c-3.107 0-5.55-2.443-5.55-5.55c0-3.107 2.443-5.55 5.55-5.55zm41 9c3.107 0 5.55 2.443 5.55 5.55c0 3.107-2.443 5.55-5.55 5.55c-3.107 0-5.55-2.443-5.55-5.55c0-3.107 2.443-5.55 5.55-5.55zm-30.137 2.708l17.739 4.69C62.007 40.37 67.239 45.05 73.5 45.05l.033-.002l6.92 21.092a12.688 12.688 0 0 0-4.705 6.015l-50.916-7.654a12.611 12.611 0 0 0-3.787-7.13l10.342-21.378c.368.033.737.057 1.113.057c4.652 0 8.71-2.592 10.863-6.393zM12.5 60.95c3.107 0 5.55 2.444 5.55 5.551s-2.443 5.55-5.55 5.55c-3.107 0-5.55-2.443-5.55-5.55c0-3.107 2.443-5.55 5.55-5.55zm75 10c3.107 0 5.55 2.444 5.55 5.551s-2.443 5.55-5.55 5.55c-3.107 0-5.55-2.443-5.55-5.55c0-3.107 2.443-5.55 5.55-5.55z"
        fill={fillColor}
      />
    </g>
  </svg>
);
