import { useWorkspaceState } from "@/app/features/map-editor";
import OutLook from "./OutLook";
import OverViewParcel from "./OverViewParcel";
import OverViewBlock from "./OverViewBlock";
import OverViewRegion from "./OverViewRegion";
export default function LevelDetails() {
    // get selected feature
    const {features, selectedFeatureId} = useWorkspaceState();
    const selectedFeature = features.features.find(
        (f) => f.id === selectedFeatureId
    );
    const levelFeature = selectedFeature?.properties.level;

    return(
        <div className="w-full flex flex-col gap-2 bg-(--app-bg) p-5 rounded-3xl" dir="rtl">
            {levelFeature === "parcel" ? (
            <OverViewParcel id={selectedFeatureId ?? ""} level={levelFeature}/>
            ) : levelFeature === 'block' ? (
                <OverViewBlock id={selectedFeatureId ?? ""} level={levelFeature}/>
            ) : levelFeature === 'region' ? (
                <OverViewRegion id={selectedFeatureId ?? ""} level={levelFeature}/>
            ) : "No feature selected."
            }
            {/* <OutLook/> */}
        </div>
    );
}
