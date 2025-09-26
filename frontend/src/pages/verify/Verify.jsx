import React from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { server } from "../../main.jsx";
import Loading from "../../Loading.jsx";
import { useEffect } from "react";
import axios from "axios";

const Verify = () => {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const params = useParams();

  const [loading, setLoading] = useState(true);
  async function verifyUser() {
    try {
      const { data } = await axios.post(
        `${server}/api/user/verify/${params.token}`
      );
      setSuccess(data.message);
    } catch (error) {
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{
    verifyUser()
  },[])
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="w-[200px] m-auto mt-12">
          {success && <p className="text-green-500 text-2xl">{success}</p>}
          {error && <p className="text-red-500 text-2xl">{error}</p>}
        </div>
      )}
    </>
  );
};

export default Verify;
