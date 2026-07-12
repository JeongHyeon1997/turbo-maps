export interface GuideStepEntry {
  title: string;
  body: string;
}

// "위로그 사용법" step copy — planner-authored, cross-checked against `/privacy`,
// `/terms` and the 0007 anonymization migration (docs/plan/10-content.md). Do not
// edit the wording here without re-validating against those docs; typo fixes only.
export const guideSteps: GuideStepEntry[] = [
  {
    title: '1. 소셜 로그인으로 시작하기',
    body: '카카오 또는 구글 계정으로 로그인하면 바로 시작할 수 있어요. 복잡한 가입 절차 없이 평소 쓰던 계정으로 몇 번의 탭이면 준비가 끝나요. 로그인하면 위로그가 자동으로 프로필을 만들어 둡니다.',
  },
  {
    title: '2. 커플 연결하기',
    body: '위로그는 두 사람이 함께 쓰는 서비스예요. 한 사람이 커플 연결 화면에서 초대 코드를 만들고, 상대방이 그 코드를 입력하면 두 계정이 하나의 커플로 이어져요. 연결이 끝나면 지금까지의 기록과 앞으로의 기록을 두 사람이 함께 보고 남길 수 있어요.',
  },
  {
    title: '3. 데이트 기록 남기기',
    body: '함께한 하루를 한 건의 기록으로 남겨 보세요. 방문한 장소를 지도에서 검색해 순서대로 담고, 각 장소에 평점과 메모를 더할 수 있어요. 그날 찍은 사진도 여러 장 올리고, 이동한 경로까지 함께 기록하면 나중에 그날을 더 생생하게 되돌아볼 수 있어요.',
  },
  {
    title: '4. 공개 코스로 나누기',
    body: '기록을 작성할 때 공개로 설정하면, 우리의 데이트 코스를 다른 커플들과 나눌 수 있어요. 이때 공개되는 건 코스 제목과 날짜, 방문한 장소와 평점, 커버 사진 한 장뿐이에요. 메모와 나머지 사진, 실제 이동 경로선은 공개되지 않고, 누가 남긴 기록인지도 드러나지 않으니 안심하고 나눠도 돼요.',
  },
  {
    title: '5. 다른 커플의 코스 둘러보기',
    body: '탐색 화면에서는 다른 커플들이 공개한 데이트 코스를 구경할 수 있어요. 마음에 드는 코스를 열어 어떤 장소들을 다녀왔는지 살펴보고, 장소별 페이지나 지역별 탐색으로 "우리 동네 데이트 코스"나 가고 싶은 곳을 찾아볼 수 있어요.',
  },
];
