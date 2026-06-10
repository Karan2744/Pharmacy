"use client";

export default function usePincodes() {

    const [pincodes, setPincodes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPincodes = async () => {
        setLoading(true);

        try {
            const res = await fetch("/api/pincodes");
            const data = await res.json();

            if(data.success) {
                setPincodes(data.data);
            }
        
         } finally {
            setLoading(false);
         }
    };
}