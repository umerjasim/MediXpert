import { inject, observer } from "mobx-react";
import Editor from "./Editor";
import { useEffect, useState } from "react";
import globalStore from "../../Store/globalStore";
import designerStore from "../../Store/designerStore";
import Notification from "../../Global/Notification";
import { t } from "i18next";

const Designer: React.FC = () => {

    const [pageSizes, setPageSizes] = useState<any[]>([]);
    const [hashtags, sethashtags] = useState<any[]>([]);
    const [documentTypes, setDocumentTypes] = useState<any[]>([]);
    const [documentMaster, setDocumentMaster] = useState<any[]>([]);

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        globalStore.setLoading(true);
        try {
            await designerStore.getData();
            setPageSizes(designerStore.pageSizes);
            sethashtags(designerStore.hashtags);
            setDocumentTypes(designerStore.documentTypes);
            setDocumentMaster(designerStore.documentMaster);
            console.log(designerStore.documentMaster)
        } catch (error) {
            Notification.error({
                message: t('error'),
                description: t('defaultErrorMessage')
            });
        } finally {
            setTimeout(() => {
                globalStore.setLoading(false);
            }, 500);
        }
    };

    return (
        <div>
            <Editor pageSizes={pageSizes} hashtags={hashtags} documentTypes={documentTypes} documentMaster={documentMaster} />
        </div>
    );
};

export default inject('globalStore')(observer(Designer));