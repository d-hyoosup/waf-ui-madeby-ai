// src/constants/awsRegions.ts

export interface AWSRegion {
  code: string;
  name: string;
  scope: 'REGIONAL' | 'CLOUDFRONT';
}

export const AWS_REGIONS: AWSRegion[] = [
  // CloudFront (글로벌 서비스)
  { code: 'aws-global', name: '글로벌 (CloudFront)', scope: 'CLOUDFRONT' },

  // Regional 리전들
  { code: 'us-east-1', name: '버지니아 북부 (us-east-1)', scope: 'REGIONAL' },
  { code: 'us-east-2', name: '오하이오 (us-east-2)', scope: 'REGIONAL' },
  { code: 'us-west-1', name: '캘리포니아 북부 (us-west-1)', scope: 'REGIONAL' },
  { code: 'us-west-2', name: '오리건 (us-west-2)', scope: 'REGIONAL' },
  { code: 'af-south-1', name: '케이프타운 (af-south-1)', scope: 'REGIONAL' },
  { code: 'ap-east-1', name: '홍콩 (ap-east-1)', scope: 'REGIONAL' },
  { code: 'ap-south-1', name: '뭄바이 (ap-south-1)', scope: 'REGIONAL' },
  { code: 'ap-south-2', name: '하이데라바드 (ap-south-2)', scope: 'REGIONAL' },
  { code: 'ap-northeast-3', name: '오사카 (ap-northeast-3)', scope: 'REGIONAL' },
  { code: 'ap-northeast-2', name: '서울 (ap-northeast-2)', scope: 'REGIONAL' },
  { code: 'ap-southeast-1', name: '싱가포르 (ap-southeast-1)', scope: 'REGIONAL' },
  { code: 'ap-southeast-2', name: '시드니 (ap-southeast-2)', scope: 'REGIONAL' },
  { code: 'ap-southeast-3', name: '자카르타 (ap-southeast-3)', scope: 'REGIONAL' },
  { code: 'ap-southeast-4', name: '멜버른 (ap-southeast-4)', scope: 'REGIONAL' },
  { code: 'ap-northeast-1', name: '도쿄 (ap-northeast-1)', scope: 'REGIONAL' },
  { code: 'ca-central-1', name: '캐나다 중부 (ca-central-1)', scope: 'REGIONAL' },
  { code: 'eu-central-1', name: '프랑크푸르트 (eu-central-1)', scope: 'REGIONAL' },
  { code: 'eu-central-2', name: '취리히 (eu-central-2)', scope: 'REGIONAL' },
  { code: 'eu-west-1', name: '아일랜드 (eu-west-1)', scope: 'REGIONAL' },
  { code: 'eu-west-2', name: '런던 (eu-west-2)', scope: 'REGIONAL' },
  { code: 'eu-south-1', name: '밀라노 (eu-south-1)', scope: 'REGIONAL' },
  { code: 'eu-south-2', name: '스페인 (eu-south-2)', scope: 'REGIONAL' },
  { code: 'eu-west-3', name: '파리 (eu-west-3)', scope: 'REGIONAL' },
  { code: 'eu-north-1', name: '스톡홀름 (eu-north-1)', scope: 'REGIONAL' },
  { code: 'me-central-1', name: 'UAE (me-central-1)', scope: 'REGIONAL' },
  { code: 'me-south-1', name: '바레인 (me-south-1)', scope: 'REGIONAL' },
  { code: 'sa-east-1', name: '상파울루 (sa-east-1)', scope: 'REGIONAL' },
];

// 리전 코드로 리전 정보 찾기
export const getRegionByCode = (code: string): AWSRegion | undefined => {
  return AWS_REGIONS.find(region => region.code === code);
};

// 리전 이름 가져오기 (코드 포함 형식)
export const getRegionDisplayName = (code: string): string => {
  const region = getRegionByCode(code);
  return region ? region.name : code;
};