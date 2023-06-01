import HomeContext from "@/pages/home/home.context"
import { useContext } from "react"

const DocumentViewer = () => {
    const { state: { selectedDocument } } = useContext(HomeContext)


    return (
        <>
            {selectedDocument ? 
                <div className="relative flex-1">   
                    <iframe src={selectedDocument.content} className="w-full h-full"/>
                </div>
            : <></>}
        </>
    )
}

export default DocumentViewer