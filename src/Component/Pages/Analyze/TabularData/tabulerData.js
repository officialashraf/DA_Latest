
import { useState, useEffect } from "react";
import { Table, Pagination } from "react-bootstrap";
import Cookies from "js-cookie";
import axios from "axios";
import "../../../../Assets/Stlyes/Filter/caseTableData.css";
import { useSelector, useDispatch } from "react-redux";
import "../../../../Assets/Stlyes/pagination.css";
import {
  setSumaryHeadersAction,
  setSummaryDataAction,
} from "../../../../Redux/Action/filterAction";
import { setSummaryData } from "../../../../Redux/Action/caseAction";
import Loader from "../../Layout/loader";

const TabulerData = () => {
  const dispatch = useDispatch();
  const data1 = useSelector((state) => state.caseData.caseData);
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [items, setItems] = useState();
  const itemsPerPage = 50;

  useEffect(() => {
    fetchCaseData(currentPage);
  }, [currentPage]);

  const fetchCaseData = async (page) => {
    const token = Cookies.get("accessToken");
    try {
      const queryData = {
        query: {
          unified_case_id: `${data1.id}`,
        },
        page: page,
        // limit: itemsPerPage
      };

      const response = await axios.post(
        "http://5.180.148.40:9006/api/das/search",
        queryData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = response.data;
      const dataArray = responseData.results;
      console.log("dataaryy", dataArray);
      const totalItems = responseData.total_results; // Assuming backend returns total items count
      console.log("totalresluts", totalItems);
      if (Array.isArray(dataArray) && dataArray.length > 0) {
        const allKeys = new Set();
        dataArray.forEach((item) => {
          Object.keys(item).forEach((key) => {
            allKeys.add(key);
          });
        });

        setHeaders(Array.from(allKeys));
        setData(dataArray);
        setTotalPages(Math.ceil(totalItems / itemsPerPage));
        setItems(totalItems);
      }

      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error);
      setLoading(false);
    }
  };

  dispatch(setSummaryDataAction(data));
  dispatch(setSumaryHeadersAction(headers));

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // const handlePageChange = (pageNumber) => {
  //     if (pageNumber !== currentPage) {
  //         setCurrentPage(pageNumber);
  //     }
  // };
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // First 10% pages (rounded up)
  const visiblePages = Math.ceil(totalPages * 0.03);

  let pages = [];

  for (let i = 1; i <= visiblePages; i++) {
    pages.push(i);
  }
  if (currentPage > visiblePages && currentPage < totalPages) {
    pages.push(currentPage);
  }
  // Always include the last page
  if (totalPages > visiblePages + 1) {
    pages.push(".................");
    pages.push(totalPages);
  }

  //   const maxPagesBeforeEllipsis = Math.floor(totalPages * 0.1);

  // const handlePageChange = (pageNumber) => {
  //   if (pageNumber !== currentPage) {
  //     onPageChange(pageNumber);
  //   }
  // };
  return (
    <>
      <div
        className="case-t"
        style={{ overflowY: "auto", height: "450px", fontSize: "10px" }}
      >
        {data && data.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header} className="fixed-th">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  {headers.map((header) => (
                    <td key={header} className="fixed-td">
                      <div className="cell-content" title={item[header]}>
                        {item[header]}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No data available.</p>
        )}
      </div>

      {/* {totalPages > 1 && (
                <Pagination>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <Pagination.Item
                            key={number}
                            active={number === currentPage}
                            onClick={() => handlePageChange(number)}
                        >
                            {number}
                        </Pagination.Item>
                    ))}
                </Pagination> 
            )} */}
      <div className="paginationstabs"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pagination>
          <Pagination.Prev
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          />

          {pages.map((number, index) => (
            <Pagination.Item
              key={index}
              active={number === currentPage}
              onClick={() => number !== "..." && handlePageChange(number)}
              disabled={number === "..."}
            >
              {number}
            </Pagination.Item>
          ))}

          <Pagination.Next
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
        <div style={{ fontSize: "12px", marginRight: "10px" }}>
          Page {currentPage} - {itemsPerPage} / {items}
        </div>
      </div>
    </>
  );
};

export default TabulerData;
